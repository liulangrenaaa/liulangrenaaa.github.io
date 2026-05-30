# Perfetto与BatteryHistorian分析方法

当我们在排查功耗问题时，仅凭命令行输出是很难看清全貌的。我们需要可视化的分析利器来辅助定位：
1. **`Battery Historian`**：宏观分析神兵。适合分析数小时甚至数天内的整体耗电趋势，抓取导致不休眠的 WakeLock 罪魁祸首、后台高频 Alarm 及蜂窝网尾部耗电。
2. **`Perfetto`**：微观剖析神器。适合分析几秒钟或几分钟内的极致性能与能耗状态，精确到微秒级查看 CPU 核心变频、内核 CPUIdle 睡眠比例、EAS 调度分配和内核唤醒源触发。

本节我们将手把手教你如何捕捉并分析这两类高阶功耗报告。

---

## 一、 Battery Historian 宏观功耗分析方法

`Battery Historian` 是 Google 开发的用于解析 `bugreport` 文件的可视化开源工具。它能将系统中错综复杂的电量指标绘制在一条统一的时间轴上。

### 1. 实战：高精度捕获步骤
为了获得最详尽的后台锁和统计细节，请务必在测试前打开**全量历史记录开关**：

```bash
# 1. 开启全量 WakeLock 历史记录追踪 (系统默认是关闭的以节省内存)
adb shell dumpsys batterystats --enable full-wake-history

# 2. 重置电量统计数据，清除干扰缓存
adb shell dumpsys batterystats --reset

# 3. 【核心测试阶段】断开物理连接进行功耗测试 (如静置 2 小时)
adb shell dumpsys battery unplug
# (在这期间，让手机静置于测试环境，复现耗电问题)

# 4. 测试结束，恢复充电状态并导出 bugreport 压缩包
adb shell dumpsys battery reset
adb bugreport bugreport.zip
```

### 2. Battery Historian 核心指标解读
将导出的 `bugreport.zip` 上传至 Battery Historian 网页分析平台后，重点观察以下时间轴：

```
                      Battery Historian 时间轴示意
                      
 Battery Level: 100% ─────────────────────────┐
                                              └───────────────────── (电量阶梯式下降)
 Screen:       ████████ (亮屏)                                  
 CPU running:  ███████████████████████████████████████████████████████ (灭屏后 CPU 依然在跑)
 WakeLock:              ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      (发现超长 WakeLock)
 Top App:      [Com.app.A]                                             
 Alarms:       ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲   ▲ (发现高频 Alarm 唤醒)
```

* **`Battery Level`**：电量百分比。如果曲线斜率在灭屏后依然很陡，说明存在“灭屏后台高耗电”。
* **`CPU running`** 与 **`Screen`** 的重合度：**最关键的指标**。正常情况下，灭屏（Screen 行为空白）后，`CPU running` 也应当呈现大面积空白。如果屏幕灭了，`CPU running` 依然是一整条实线，说明系统被“强行吊住”，无法进入 Suspend。
* **`WakeLocks`**：查看是哪个 UID 的什么 Tag 一直持锁未释放。
* **`Long Wakelocks`** 表格（位于底部的 System Stats 页签）：直接按时间降序排序列出全系统持有最久的锁，锁泄露问题一目了然。

---

## 二、 Perfetto 微观功耗分析方法

当 Battery Historian 告诉你有异常唤醒，或者系统在休眠后被高频唤醒（但找不到明显的 Java WakeLock）时，我们需要使用 **Perfetto** 深入内核层，观察微秒级的 CPUFreq 调频和内核中断。

### 1. 配置 Perfetto 功耗追踪模板 (Trace Config)
在 `ui.perfetto.dev` 的 Record 页面中，为了精准诊断功耗，需要开启以下内核追踪源（Data Sources）：

```protobuf
# 核心功耗 Trace 配置参数片段
data_sources: {
    config {
        name: "linux.ftrace"
        ftrace_config {
            # 1. 追踪 CPU 频率改变与变频器动作
            ftrace_events: "power/cpu_frequency"
            # 2. 追踪 CPUIdle 状态 (C-States)
            ftrace_events: "power/cpu_idle"
            # 3. 追踪内核级休眠与唤醒链路
            ftrace_events: "power/suspend_resume"
            # 4. 追踪进程调度 (EAS 大小核分配)
            ftrace_events: "sched/sched_switch"
            # 5. 追踪内核唤醒源 (Wakeup Sources)
            ftrace_events: "power/wakeup_source_activate"
            ftrace_events: "power/wakeup_source_deactivate"
        }
    }
}
```

### 2. 抓取 Trace 命令
配置好后，可以通过 ADB 运行生成的 perfetto 命令，抓取例如 20 秒的 Trace：
```bash
adb shell perfetto -c - --txt -o /data/misc/perfetto-traces/power.trace <<EOF
... (将 Web 端生成的配置粘贴至此) ...
EOF
# 将抓取好的文件拉取到电脑
adb pull /data/misc/perfetto-traces/power.trace ./
```

### 3. Perfetto 功耗 Trace 深度剖析要点
将 `power.trace` 拖入 `ui.perfetto.dev` 网页中，进行如下剖析：

#### 检查 CPU Idle States (C-States)
在时间轴上展开 `CPU` 轨道，每个 CPU 核心下方会有一条 `CPU Idle` 轨迹：
* 如果数值为 `-1`，代表 CPU 处于活跃态（C0）。
* 如果数值为 `0`、`1`、`2`，代表进入了相应的 C-State。数值越大，睡眠越深。
* **问题诊断**：在纯待机、无任何操作的时间段，检查 CPU 是否能长时间保持在最深状态（如 2 或 3）。如果频繁在 `-1` 和 `0` 之间高频跳变，代表 CPU 频繁被微小的硬件中断或定时任务“戳醒”，无法沉睡，浪费极大。

#### 分析 CPU Frequency Track (P-States)
查看 `Cpu Frequency` 轨道：
* 检查在触控滑动时是否有正常的 `schedutil` 瞬间 Boost 提速。
* 检查在温控高热阶段，最大主频是否被成功“削平”（例如物理最高 2.8GHz 被限死在 1.2GHz）。

#### 诊断内核休眠（Suspend/Resume Slice）
在系统尝试休眠时，会有一条名为 `suspend_resume` 的全局轨迹：
* **`suspend_enter`**：系统开始挂起。
* **异常表现**：如果 `suspend_enter` 的切片极短，后面瞬间跟着 `resume`，代表挂起失败（Suspend Aborted）。
* 此时在下方的事件列表中，搜索 `wakeup_source_activate` 事件，查看是哪个驱动唤醒源（例如 `wlan` 或某个 I2C 设备）在最后一刻抛出了中断，阻止了内核挂起。

通过 `Battery Historian` 先锁定“谁在消耗大电量”，再通过 `Perfetto` 挖出“底层究竟在做什么细微动作”，是 Android 资深功耗工程师最核心的“两板斧”实战武器。

下一章我们将通过 3 个经典的真实案例，带你进入实战演练 —— **[16_典型功耗问题排查案例.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/16_%E5%85%B8%E5%9E%8B%E5%8A%9F%E8%80%97%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5%E6%A1%88%E4%BE%8B.md)**。
