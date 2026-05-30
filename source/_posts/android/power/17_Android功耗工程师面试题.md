# Android 功耗工程师面试题

在申请各大手机 OEM 厂商（小米、OPPO、vivo、华为、荣耀等）以及芯片大厂（高通、联发科等）的 Android 系统与 Framework 开发岗位时，功耗调优（Power Optimization）是拉开技术档次的最核心考点。

以下为你整理了 **5 道最高频、最硬核的 Android 功耗工程师面试真题**，并附带基于 **AOSP 14** 的标准满分回答模板。

---

## 真题一：请详细阐述 WakeLock 从 Java 层申请到内核层生效的完整生命周期链路。如果进程意外崩溃，系统如何防止锁泄露？

### 典型考点
* PMS 核心架构设计。
* Binder 跨进程通信与死亡代理机制（`DeathRecipient`）。
* User-space 与 Kernel-space 的电源控制屏障。

### 满分回答模板
1. **申请链路调用流**：
   * **App 端**：调用 `PowerManager.WakeLock.acquire()`。这会在内部通过 Binder 调用 `IPowerManager.aidl` 的接口，向运行在 `system_server` 的 `PowerManagerService`（PMS）发起跨进程调用。
   * **Framework PMS 端**：PMS 接收到请求后，通过权限校验，在内部维护的 `mWakeLocks` 列表中插入一个 `PowerManagerService.WakeLock` 对象，并计算生成最新的 `mWakeLockSummary`。
   * **JNI 向上转型**：PMS 触发 `updatePowerStateLocked()`，在最后阶段 `updateSuspendBlockerLocked()` 中，若判断存在活动的 Partial WakeLock，会触发底层的 Native `SuspendBlocker` 的 `acquire` 操作，通过 JNI 跨越到 C++ 世界。
   * **Native 挂起服务**：Native 层的 `libpower` 会通过 AIDL 调用本地守护进程 `system_suspend`。
   * **内核写入**：`system_suspend` 最终通过 `write()` 系统调用，向内核的物理节点 `/sys/power/wake_lock` 写入该锁的标识字符串，以此申请内核级的 `wakeup_source`。内核的 Linux PM Core 收到该请求，就会让系统拒绝进入 Deep Suspend 状态。

2. **异常防泄露机制**：
   * **DeathRecipient 监听**：在 Java 层 PMS 内部的 `WakeLock` 构造函数中，会将传入的客户端 Binder Token 绑定一个死亡回调监听器：`mToken.linkToDeath(this, 0)`。
   * **生命期解除**：如果持有锁的 App 发生崩溃、被强杀或 OOM 杀掉，App 的 Binder 通道关闭。系统 Binder 驱动会迅速向 `system_server` 发射中断信号，触发 PMS 中对应的 `binderDied()` 方法。
   * **自动释放**：PMS 会在此回调中把该锁从 `mWakeLocks` 队列中强行剥离，重新执行 `updatePowerStateLocked()` 更新电源状态，并将底层的物理锁释放，完美防御锁泄露。

---

## 真题二：请解释 Deep Doze（深度低电耗模式）与 Light Doze（轻度低电耗模式）的核心区别，并详述其状态机转换与运动传感器的配合关系。

### 典型考点
* `DeviceIdleController` 状态机机制。
* 传感器数据治理对功耗的影响。

### 满分回答模板
1. **核心设计定位的区别**：
   * **Deep Doze**：针对**绝对静置、未充电、屏灭**的场景（如手机放在桌子上去睡觉）。它采取极度严苛的管控，限制网络、普通 Alarm、WakeLock、Wi-Fi/蓝牙扫描，以及延迟所有的 Job。
   * **Light Doze**：针对**移动中、未充电、屏灭**的场景（如用户将手机装入口袋在街上行走）。它为了不打扰基本通知，不限制 WakeLock 和定位，但会对不紧急的后台网络和 Job 进行周期性推迟拦截。

2. **状态机与运动传感器（Significant Motion Sensor - SMS）的配合逻辑**：
   * 在 Deep Doze 的流转中，从 `ACTIVE` 灭屏进入 `INACTIVE` 后，系统会启动一段倒计时。
   * 倒计时结束后，状态机切换至 `STATE_SENSING`（感应态）。此时，`DeviceIdleController` 会向传感器子系统注册一个 **有效运动传感器（Significant Motion Sensor）** 的监听器。
   * **物理判断**：此时，主 CPU 可以进入短时休眠。若用户拿起手机移动，SMS 芯片（通常运行在超低功耗的 Sensor Hub DSP 上）会在硬件层检测到这一运动，发送中断信号强制唤醒主 CPU。
   * **状态退回**：状态机收到 SMS 触发信号，得知手机当前处于被携带移动中，会立刻放弃进入 Deep Doze，并将状态退回到 `STATE_INACTIVE`。
   * **空闲沉睡**：只有当 SMS 在设定时间内一直没有检测到任何运动，状态机才会确认手机处于绝对静止，从而跃迁至 `STATE_LOCATING`（定位态），最终在确认位置后坠入 `STATE_IDLE`（真正的 Deep Doze 空闲待机），切断所有后台网络。

---

## 真题三：Android 系统是如何计算和统计电池消耗的？请对比传统的 `power_profile.xml` 经验模型与现代 `PowerStats` HAL (ODPM) 的技术优劣。

### 典型考点
* `BatteryStatsService` 的运作原理。
* 硬件电量轨（Power Rails）测量（On-Device Power Monitor - ODPM）机制。

### 满分回答模板
1. **传统的 `power_profile.xml` 估算模型**：
   * **原理**：这是一种**“软件时长 $\times$ 额定电流”**的数学经验估算模型。系统通过 `BatteryStatsImpl` 统计各硬件模块的活动时长（如 CPU 在各个主频下的执行毫秒数、屏幕亮屏时间、Wi-Fi 搜网时长），然后乘上厂商预置在 `power_profile.xml` 中通过实验室测量出的固定额定工作电流，累加得到整体 mAh。
   * **缺点**：误差极大。因为 CPU 的功耗受温度、负载类型影响波动剧烈；Wi-Fi 模块在弱网与强网环境下的发射功率也天差地别，静态常数根本无法适应动态物理世界的复杂度。

2. **现代 `PowerStats` HAL (ODPM) 架构**：
   * **原理**：自 Android 10 起引入并于 **Android 14** 完善。它依靠电源管理芯片（PMIC）内置的硬件采样器，直接在主要硬件电源轨（如 CPU Rail, GPU Rail, Modem Rail, Display Rail）上物理测量实时的电压与电流，输出精确到**微焦耳（micro-joules）**的物理累加能量值。
   * **优势**：
     * **精度飞跃**：能真实反映硬件在不同网络信号、不同屏幕色彩亮度、不同发热温度下的物理真实耗电。
     * **公平归因**：结合 CPU 占空比等软件权重，能极高精度地将物理电量公平地摊派到具体的 App 进程 UID 上，让耗电排行不再是单纯的估值。

---

## 真题四：在 Perfetto 报告中发现系统频繁产生 Suspend Abort（挂起中止），导致设备无法深睡。你会从哪些维度进行排查？请详述排查思路。

### 典型考点
* Linux Kernel Suspend 挂起流。
* 内核唤醒源（Wakeup Sources）与硬件中断（IRQs）。

### 满分回答模板
系统频繁产生 Suspend Abort，代表 Linux 内核的休眠流程在 `suspend_devices_and_enter()` 或更底层由于检测到未决的中断或唤醒事件而被强行中断。排查应遵循**自上而下、由软到硬**的三个维度：

1. **维度一：用户空间残留锁排查**
   * 使用 `adb shell dumpsys power` 检查 `SuspendBlockers`。
   * 查看 `libpower` 的 system_suspend 服务中是否仍有挂载的 Native WakeLock 未被妥善释放。
   * **验证**：如果 `dumpsys` 显示所有锁全部释放，说明用户空间逻辑清白，问题出在内核或底层硬件。

2. **维度二：分析内核级唤醒源（Wakeup Sources）**
   * **Perfetto 诊断**：在 Perfetto 时间轴上，搜索 `wakeup_source_activate` 和 `wakeup_source_deactivate` 事件轨道。
   * **数据获取**：在手机上执行 `cat /sys/kernel/debug/wakeup_sources`，分析哪一个 `wakeup_source` 的 `active_count`（激活次数）或 `prevent_suspend_time`（阻止休眠时长）居于首位。
   * **经典定位**：
     * 若 `wlan` 唤醒源异常高，排查 Wi-Fi 驱动是否频繁接收到路由器的多播广播包（ARP 广播）。
     * 若 `alarmtimer` 唤醒源异常高，说明上层有高频定时任务（Alarm）强行拉起 CPU。

3. **维度三：物理中断（IRQs）引发的休眠打断**
   * 有时硬件线路上存在漏电或外设硬件故障，会产生高频的中断脉冲（Spikes），这在休眠最后一刻会通过硬件 GIC（通用中断控制器）直接打断 ARM 的 WFI 状态。
   * **排查**：读取内核节点 `/proc/interrupts`，对比前后一分钟内各个物理中断线的计数变化。如果发现某个 GPIO 中断线在静置时计数狂飙，说明对应外设（如指纹芯片、触摸板、传感器）存在物理硬件级别的异常拉高发包。

---

## 真题五：请阐述 EAS（能量感知调度器）在 ARM 异构多核架构下的核心工作原理，并说明它是如何与 `schedutil` 调频器协同优化的。

### 典型考点
* 现代异构多核（big.LITTLE / DynamIQ）调度算法。
* 能量模型（Energy Model - EM）与算力/能效的对等关系。

### 满分回答模板
1. **EAS 的工作原理**：
   * EAS 彻底摒弃了传统 CFS 调度器只追求“负载绝对均衡”的粗糙设计，转而以**“能效最优化”**为调度核心。
   * **物理能量模型（EM）**：EAS 在初始化时会加载 SoC 的功耗能量表，记录了大核、中核、小核在各个运行频点下的真实物理功耗。
   * **动态算力评估**：当有一个任务被唤醒或创建时，EAS 不会盲目分配，而是利用进程的 **PELT (Per-Entity Load Tracking)** 历史算力需求指标，尝试将其模拟放置到不同的核心集群中。
   * **能效差值决策**：EAS 会利用能量模型计算不同放置方案下，**整机 SOC 增加的总能耗增量值 ($\Delta P$)**：
     $$\Delta P = P_{\text{放置后新能耗}} - P_{\text{放置前能耗}}$$
     EAS 最终会选择**能耗增量 $\Delta P$ 最小，且当前核心算力天花板足以在该帧内处理完该任务**的核心进行派发。这使得轻载小任务永远被困在低功耗小核，大核得以最大程度深睡。

2. **与 `schedutil` 的协同机制**：
   * **算力与主频解耦统一**：`schedutil` 调频器也是直接基于调度器的 PELT 负载指标进行微秒级响应。
   * **无缝联动**：当 EAS 将一个中等任务分配到小核集群后，小核集群的 PELT 负载占比上升。`schedutil` 检测到该核心负载变高，会**同步、零延迟**地计算出最贴合该负载的物理频点，调高电压；当 EAS 将任务迁移走时，`schedutil` 会瞬间降低频点。
   * 这种“调度位置计算（EAS）”与“调频决策计算（schedutil）”共享同一套 PELT 负载追踪信号的设计，实现了性能与功耗控制的完美协调。

下一章我们将为你提供如何将这些硬核知识包装到简历中的终极指南 —— **[18_功耗岗位项目经验包装模板.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/18_%E5%8A%9F%E8%80%97%E5%B2%97%E4%BD%93%E7%B3%BB%E9%A1%B9%E7%9B%AE%E7%BB%8F%E9%AA%8C%E5%8C%85%E8%A3%85%E6%A8%A1%E6%9D%BF.md)**。
