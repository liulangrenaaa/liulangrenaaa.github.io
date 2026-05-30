# Android 功耗体系整体架构

Android 功耗管理（Power Management）是一个典型的分层系统。它横跨了从最底层的 Linux 内核电源管理机制，经过硬件抽象层（HAL）、本地守护进程（Native Daemon）、系统服务层（System Services），直到应用框架层（Framework API）和应用程序（App）。

本节将从全局视角出发，自底向上剖析 Android 14 (AOSP 14) 的功耗体系整体架构。

---

## 一、 Android 功耗体系五层分层架构

Android 系统的功耗架构可以划分为以下五个核心层级：

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. 应用程序层 (Application Layer)                                       │
│    App 调用的高层 API: PowerManager.WakeLock, JobScheduler, Alarm, etc. │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Binder IPC
┌───────────────────────────────────▼────────────────────────────────────┐
│ 2. 核心服务与框架层 (Framework & System Services)                       │
│    - PowerManagerService (PMS)      - DeviceIdleController (Doze)      │
│    - BatteryStatsService            - ThermalManagerService            │
│    - DisplayPowerController         - JobScheduler / AlarmManager      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Binder IPC / JNI
┌───────────────────────────────────▼────────────────────────────────────┐
│ 3. 本地守护进程与系统库层 (Native Services & Daemons)                  │
│    - libpower (提供 C/C++ 唤醒锁接口)                                  │
│    - healthd / system_health (电池状态收集守护进程)                    │
│    - thermald (厂商特定温控守护进程)                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HAL Binder / HIDL
┌───────────────────────────────────▼────────────────────────────────────┐
│ 4. 硬件抽象层 (Hardware Abstraction Layer - HAL)                       │
│    - Power HAL (`IPower.aidl` / `IPowerStats.aidl`)                    │
│    - Health HAL (`IHealth.aidl`)                                       │
│    - Thermal HAL (`IThermal.aidl`)                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Sysfs / IOCTL / Driver Call
┌───────────────────────────────────▼────────────────────────────────────┐
│ 5. 内核层 (Linux Kernel Layer)                                         │
│    - Linux PM Core (Suspend / Resume / Autosleep)                      │
│    - Wakeup Sources / Kernel Wakelocks (/sys/power/wake_lock)          │
│    - EAS (Energy Aware Scheduling) & CPUFreq / CPUIdle                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 二、 核心组件与对应源码路径 (AOSP 14)

在分析 Android 14 源码时，各个层级的关键模块与本地路径对照如下：

| 层级 | 模块名称 | AOSP 14 关键源码路径 (基于 `/home/suhui/workspace/aosp/los21/frameworks`) |
| :--- | :--- | :--- |
| **应用层** | `PowerManager` | `base/core/java/android/os/PowerManager.java` |
| **系统服务层** | `PowerManagerService` | `base/services/core/java/com/android/server/power/PowerManagerService.java` |
| **系统服务层** | `BatteryStatsService` | `base/services/core/java/com/android/server/am/BatteryStatsService.java` |
| **系统服务层** | `DeviceIdleController` | `base/services/core/java/com/android/server/DeviceIdleController.java` |
| **系统服务层** | `ThermalManagerService` | `base/services/core/java/com/android/server/power/ThermalManagerService.java` |
| **系统服务层** | `DisplayPowerController` | `base/services/core/java/com/android/server/display/DisplayPowerController.java` |
| **Native层** | `libpower` | `hardware/interfaces/power/` (对应 AIDL 定义接口)<br>`system/core/libpower/` (C/C++ 封装的 wakelock 库) |
| **HAL层** | `Power HAL` | `hardware/interfaces/power/aidl/` (AIDL 形式的 HAL 接口) |
| **HAL层** | `Health HAL` | `hardware/interfaces/health/aidl/` |
| **HAL层** | `Thermal HAL` | `hardware/interfaces/thermal/aidl/` |

---

## 三、 五大层级的工作职责与协作机制

### 1. 应用程序层 (Application Layer)
该层是功耗的“消费者”。App 并不能直接操作硬件的低功耗模式，而是通过 Android SDK 提供的功耗管理组件来间接请求资源。例如：
* **`WakeLock`**：请求保持 CPU 在灭屏后继续运转。
* **`AlarmManager`**：在特定时间唤醒系统执行任务。
* **`JobScheduler`**：向系统申请在满足特定条件（如连接 Wi-Fi 且充电时）执行批处理任务。

### 2. 核心服务与框架层 (System Services)
该层是 Android 功耗的“大脑”与决策核心。所有的服务都运行在 `system_server` 进程中：
* **`PowerManagerService (PMS)`**：汇总全系统的电源请求（如亮灭屏、WakeLock），控制核心状态机（Interactive / Asleep / Doze）。
* **`DeviceIdleController (Doze)`**：监控用户行为。当设备静置且未充电时，进入 Doze 模式，限制 App 的网络访问、Alarm 和同步任务。
* **`BatteryStatsService`**：高精度记录全系统各软硬件模块的耗电情况（如 CPU、WiFi、GPS、屏幕等），供 `BatteryHistorian` 等工具分析。
* **`ThermalManagerService`**：监听 Thermal HAL 传递的温度变化，若超过限额则下发控温指令（如强制 CPU 降频、降低屏幕亮度）。

### 3. 本地守护进程与系统库层 (Native Services & Daemons)
主要起到承上启下的桥梁作用，运行在非 Java 环境中：
* **`libpower`**：为 Native 层（如 Android Runtime、MediaPlayerService、SurfaceFlinger）提供使用 WakeLock 的 C/C++ 接口。
* **`healthd` / `system_health`**：以 Daemon 形式在系统初创时运行，负责轮询电池物理芯片的数据（电压、电流、电量），并通过 Binder 上报给 `BatteryService`。

### 4. 硬件抽象层 (Hardware Abstraction Layer - HAL)
屏蔽底层硬件差异，将内核的驱动节点封装为标准的 Binder 接口。自 Android 10 起，HAL 全面转向 Binder 化（AIDL）：
* **`IPower HAL`**：实现对 CPU 调频策略的动态干预（如应用冷启动时进行 CPU Boost 提频，灭屏时进行 Hint 限制），控制低功耗状态切换。
* **`IPowerStats HAL`**：用于获取具体硬件子系统（如 GPU、Wi-Fi 芯片、调制解调器等）更精细的轨段功耗统计数据。

### 5. 内核层 (Linux Kernel Layer)
所有功耗指令的最终执行者：
* **Linux PM Core (内核电源管理核心)**：负责系统整体的挂起（Suspend）和唤醒（Resume）。当全系统没有 WakeLock 持有时，触发休眠流程（Suspend to RAM）。
* **EAS (Energy Aware Scheduling, 能量感知调度器)**：这是现代 Android 设备的默认调度机制。它根据能效模型（Energy Model）评估把任务分配给大核、中核还是小核，从而在保证流畅度的前提下，最大程度节省 CPU 功耗。
* **Kernel Wakelocks**：内核中的唤醒锁。只要内核中还存在任何一把物理锁（如驱动持有、或由用户空间映射过来的锁），内核的休眠循环就无法完成。

---

## 四、 经典场景流转示例：App 申请 WakeLock 到内核挂起

为了更好理解这一整套架构的协同工作，我们来看当一个 App 申请一把 `PARTIAL_WAKE_LOCK` 时，系统的调用流转图：

```
App (Java)
  │ PowerManager.WakeLock.acquire()
  ▼
PowerManagerService (Java System Server)
  │ updateWakeLockWorkSourceLocked()
  ▼
JNI (com_android_server_power_PowerManagerService.cpp)
  │ acquire_wake_lock()
  ▼
libpower (Native C++ Service)
  │ write() -> 写入内核节点
  ▼
Kernel Space (/sys/power/wake_lock)
  │ 持有内核级唤醒源 (Wakeup Source)
  ▼
Linux PM Core (休眠被阻止，CPU 保持运转)
```

当 App 调用 `release()` 释放 WakeLock 时，整个链路逆向调用，最终释放内核中的唤醒源。当全系统所有内核唤醒锁均被释放时，Linux 内核开始尝试挂起整个 SOC（进入 Suspend 状态），系统电流降低至数毫安（mA）级。

下一章我们将深入剖析功耗大脑 —— **[02_电源管理服务核心流程.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/02_%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86%E6%9C%8D%E5%8A%A1%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B.md)**。
