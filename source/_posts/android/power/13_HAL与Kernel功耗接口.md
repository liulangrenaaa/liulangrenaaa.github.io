# HAL与Kernel功耗接口

在 Android 系统中，所有的软件决策（如 PMS 超时灭屏、温控服务要求限频、应用冷启动需要提频）最终都必须转化为对底层硬件的配置指令。这一硬件控制边界主要通过 **Power HAL（电源硬件抽象层）** 与 Linux 内核的 **Sysfs 虚拟文件系统** 实现。

本节我们将基于 **AOSP 14**，详解 Power HAL 的 AIDL 接口设计，以及 Linux 内核中关于休眠、调频、控温的核心虚拟文件节点。

---

## 一、 Power HAL AIDL 接口详解

自 Android 10 起，Power HAL 被彻底重构并引入了 AIDL（Android Interface Definition Language）形式定义。在 AOSP 14 中，核心接口为 **`android.hardware.power.IPower`**。

它主要通过两个核心操作，向芯片厂商的底层温控及性能引擎投递 Hint（暗示/策略）：

```java
// android/hardware/power/IPower.aidl
interface IPower {
    // 1. 设置系统所处的模式 (Mode)
    void setMode(in Mode type, in boolean enabled);

    // 2. 触发系统性能暴增 (Boost)，持续指定时间
    void setBoost(in Boost type, in int durationMs);
    ...
}
```

### 1. 核心模式（Mode）与功耗映射
PMS 或温控服务通过调用 `setMode()`，告知底层硬件当前系统的大背景，以便芯片调节器动态切换能效比：
* **`Mode.LOW_POWER`**：开启省电模式。底层会立即限制超大核启动，调低 CPUFreq 的目标曲线，进入极其保守的算力分配。
* **`Mode.DEVICE_IDLE`**：系统进入 Doze 状态。硬件可以关闭一部分暂时不用的 SOC 总线和外设供电。
* **`Mode.LAUNCH`**：应用冷启动中。告诉硬件此时属于“性能最高优先级”，允许 CPU 满载工作，即使发热也在所不惜。
* **`Mode.SUSTAINED_PERFORMANCE`**：持续性能模式（多用于跑分或游戏场景）。告诉硬件限制突发的热波动，维持稳定的中高频输出，防止频率坐过山车导致掉帧。

### 2. 核心提频（Boost）
当用户触摸屏幕的一瞬间，系统需要极速响应，PMS 会调用 `setBoost()`：
* **`Boost.INTERACTION`**：触控提频。系统会瞬间将 CPU 的最低主频强行拉高（例如拉到 1.5GHz），维持几百毫秒（由 `durationMs` 指定），以消除应用滑动初始阶段的卡顿。
* **`Boost.CAMERA_LAUNCH`**：相机启动提频。迅速拉高 CPU、GPU 和 ISP 芯片的算力，确保相机预览框能在 500ms 内渲染完毕。

---

## 二、 内核休眠控制接口：`/sys/power/`

挂起服务 `system_suspend` 决定要休眠时，主要是通过写入以下 Linux 内核接口实现的：

### 1. `/sys/power/state`
* **用途**：控制系统整体电源状态。
* **操作**：
  * 读取该节点可查看支持的休眠等级（如 `mem`、`freeze`、`standby`）。
  * 写入 `mem` 会强行让内核立刻触发 `enter_state(PM_SUSPEND_MEM)`，关闭所有设备驱动并挂起 CPU 核心。

### 2. `/sys/power/autosleep`
* **用途**：内核级的自动挂起接口。
* **操作**：
  * 写入 `mem` 后，内核会启动 Autosleep 工作队列。只要当前系统内所有的 `wakeup_sources` 计数全部归零（即无锁持有），内核就**自发地、不需要用户空间干预地自动进入 Mem 状态休眠**。一旦被唤醒处理完数据，又会瞬间自动挂起。这是现代 Android 的首选深睡机制。

### 3. `/sys/power/wake_lock` 与 `/sys/power/wake_unlock`
* **用途**：供用户空间的 Legacy C++ 守护进程直接读写唤醒锁。
* **操作**：
  * `echo "MyWakelock" > /sys/power/wake_lock` 即可持有一把名为 "MyWakelock" 的内核锁，阻止休眠。
  * `echo "MyWakelock" > /sys/power/wake_unlock` 释放锁。

---

## 三、 CPU 变频与限频接口：`/sys/devices/system/cpu/`

温控服务（TMS）以及底层的 `thermald` 在需要限制 CPU 功耗以控温时，主要通过读写各 CPU 核心的 `cpufreq` 文件夹来实现：

路径格式：`/sys/devices/system/cpu/cpu<N>/cpufreq/`，其中 `<N>` 代表 CPU 核心号（如 0 到 7）。

* **`scaling_governor`**：当前核心绑定的调频器（通常是 `schedutil`）。
* **`scaling_cur_freq`**：只读节点，显示该核心当前的实时工作频率（kHz）。
* **`scaling_max_freq`**：**温控治电的最核心节点**。
  * 写入一个限制值（如将最高支持 2.8GHz 的大核限死在 `1800000` 即 1.8GHz）。
  * 只要写入，即使调度器负载再大，`schedutil` 绝对无法让核心频率突破这一设定的天花板，从而强制切断热量的持续攀升。
* **`scaling_min_freq`**：核心的最低保障频率。防止因频率过低导致核心直接陷入死锁或严重延迟。

---

## 四、 GPU 功耗控制接口

GPU 的变频也是类似的。以高通骁龙 SOC（Adreno GPU）为例，其功耗节点通常位于：

`/sys/class/kgsl/kgsl-3d0/`

* **`max_pwrlevel`**：最大功率等级。数值越小，限制程度越高（0 通常代表无限制，最高功耗）。
* **`min_clock_mhz`** / **`max_clock_mhz`**：控制 GPU 工作时钟的最大与最小值，用于游戏热降频治理。
* **`gpu_busy_percentage`**：只读，显示当前 GPU 渲染管线的忙碌占比（%），是 BatteryStats 和 Profiler 抓取 GPU 负载的关键源头。

在下一章中，我们将进入实战，把本章介绍的节点，通过最硬核的调试命令全部提取并掌控起来 —— **[14_常用功耗调试命令大全.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/14_%E5%B8%B8%E7%94%A8%E5%8A%9F%E8%80%97%E5%9C%BA%E6%99%AF.md)**。
