# AOSP 功耗学习路线总览

Android 功耗（Power Management）是 Android 系统调优、Framework 开发以及内核驱动开发中最核心且最具挑战性的领域之一。本套学习文档旨在基于 **AOSP 14 (Android 14 / API 34)**，结合 `/home/suhui/workspace/aosp/los21/frameworks` 的实际源码，为你提供一条从硬件底盘到应用层功耗优化的端到端（End-to-End）系统化路线。

---

## 一、 为什么学习 Android 功耗？

1. **核心竞争力**：功耗优化涉及 Kernel、HAL、Framework 到 App 的全栈技术，是区别于普通开发者的硬核技能。
2. **产品基石**：手机、穿戴设备、车载系统等对续航和发热极度敏感，优秀的功耗设计直接决定用户体验。
3. **高频面试考点**：各大手机 OEM 厂商（小米、OPPO、vivo、荣耀、华为等）以及芯片厂（高通、联发科等）的 Framework 岗位必考点。

---

## 二、 知识脑图与学习模块总览

我们将 Android 功耗体系划分为 **五大核心模块**，文档编号与此高度吻合：

```
                              Android 功耗学习路线
                                       │
         ┌───────────────────┬─────────┴─────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼
   【核心服务与唤醒】   【系统级低功耗机制】   【硬件服务与调频】   【统计/调试/实战】
   ┌───────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
   │01.功耗整体架构 │   │05.Doze/待机机制 │   │08.充电电池架构 │   │14.常用调试命令 │
   │02.PMS 核心流程 │   │06.显示功耗管理 │   │09.温控与功耗限制│   │15.Perfetto工具 │
   │03.WakeLock机制 │   │11.Alarm/Job    │   │10.CPU调频与调度│   │16.典型案例排查 │
   │04.休眠唤醒链路 │   │12.定位/蓝牙场景│   │13.HAL与Kernel  │   │17.功耗面试真题 │
   └───────────────┘   └────────────────┘   └────────────────┘   └────────────────┘
```

---

## 三、 本套文档目录及核心要点

### 1. 核心底盘与服务层 (PMS & WakeLock)
* **[01_Android功耗体系整体架构.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/01_Android%E5%8A%9F%E8%80%97%E4%BD%93%E7%B3%BB%E6%95%B4%E4%BD%93%E6%9E%B6%E6%9E%84.md)**：自底向上打通 Kernel - HAL - SystemServer - Framework - App 的五层架构。
* **[02_电源管理服务核心流程.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/02_%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86%E6%9C%8D%E5%8A%A1%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B.md)**：深度解析 `PowerManagerService` 的启动、核心状态机（Interactive / Asleep）、亮灭屏广播与核心锁策略。
* **[03_唤醒锁机制详解.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/03_%E5%94%A4%E9%86%92%E9%94%81%E6%9C%8D%E5%8A%A1%E6%A0%B8%E5%BF%83%E6%B5%81%E7%A8%8B.md)**：全面剖析 `WakeLock` 的生命周期，从 Java 层的 `acquire()` 到 Native 锁，再到 `kernel` 的 `wake_lock` 节点写入。
* **[04_系统休眠与唤醒链路.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/04_%E7%B3%BB%E7%BB%9F%E4%BC%91%E7%9C%A0%E4%B8%8E%E5%94%A4%E9%86%92%E9%93%BE%E8%B7%AF.md)**：深入 Linux 挂起（Suspend to RAM）原理，剖析 `suspend_backoff` 机制以及通过内核唤醒源（Wakeup Sources）排查异常唤醒。

### 2. 软件管控与低功耗策略 (Doze & Resource Control)
* **[05_Doze模式与应用待机机制.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/05_Doze%E6%A8%A1%E5%BC%8F%E4%B8%8E%E5%BA%94%E7%94%A8%E5%BE%85%E6%9C%BA%E6%9C%BA%E5%88%B6.md)**：详解 `DeviceIdleController` 与 `AppStandbyController`，分析深度/浅度 Doze 状态转移图及功耗白名单工作机制。
* **[06_亮屏灭屏与显示功耗管理.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/06_%E4%BA%AE%E5%B1%8F%E7%81%AD%E5%B1%8F%E4%B8%8E%E6%98%BE%E7%A4%BA%E5%8A%9F%E8%80%97%E7%AE%A1%E7%90%86.md)**：讲解 `DisplayPowerController` 机制，解析自动亮度（Auto-Brightness）、防漏光、动态刷新率（Variable Refresh Rate）等显示功耗优化手段。
* **[11_Alarm与JobScheduler功耗优化.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/11_Alarm%E4%B8%8EJobScheduler%E5%8A%9F%E8%80%97%E4%BC%98%E5%8C%96.md)**：分析定时器对系统的唤醒损耗，详述 `AlarmManagerService` 对齐唤醒与 `JobScheduler` 的窗口化批处理设计。
* **[12_网络定位蓝牙传感器功耗场景.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/12_%E7%BD%91%E7%BB%9C%E5%AE%9A%E4%BD%8D%E8%93%9D%E7%89%99%E4%BC%A0%E6%84%9F%E5%99%A8%E5%8A%9F%E8%80%97%E5%9C%BA%E6%99%AF.md)**：揭示 GPS 搜星功耗、定位劫持、蓝牙低功耗（BLE）扫描过滤器机制，以及传感器批处理（Batching / FIFO）如何减少 CPU 唤醒。

### 3. 硬件管理与统计归因 (Battery & Thermal & HW)
* **[07_电池统计与耗电归因机制.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/07_%E7%94%B5%E6%B1%A1%E7%BB%9F%E8%AE%A1%E4%B8%8E%E8%80%97%E7%94%B5%E5%BD%92%E5%9B%A0%E6%9C%BA%E5%88%B6.md)**：讲解 `BatteryStatsService` 的运作原理、`power_profile.xml` 功耗配置文件以及 Android 14 引入的细粒度电量测量机制。
* **[08_充电与电池服务架构.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/08_%E5%85%85%E7%94%B5%E4%B8%8E%E7%94%B5%E6%B1%A1%E6%9C%8D%E5%8A%A1%E6%9E%B6%E6%9E%84.md)**：解析 `BatteryService` 与底层的 `healthd`/Health HAL 的 Binder 交互通信链路及充电保护策略。
* **[09_温控与功耗限制机制.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/09_%E6%B8%A9%E6%8E%A7%E4%B8%8E%E5%8A%9F%E8%80%97%E9%99%90%E5%88%B6%E6%9C%BA%E5%88%B6.md)**：学习温控服务 `ThermalManagerService` 的动态热缓解模型，分析在不同发热梯度下对 CPU、GPU 及亮度的限频和降亮手段。
* **[10_CPU调频调度与低功耗状态.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/10_CPU%E8%B0%83%E9%A2%91%E8%B0%83%E5%BA%A6%E4%B8%8E%E4%BD%8E%E5%8A%9F%E8%80%97%E7%8A%B6%E6%80%81.md)**：探索 Linux CPU 变频器（CPUFreq / Schedutil 调度器）、EAS（Energy Aware Scheduling）能量感知调度、多核集群策略及 CPU C-States/P-States 低功耗模式。
* **[13_HAL与Kernel功耗接口.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/13_HAL%E4%B8%8EKernel%E5%8A%9F%E8%80%97%E6%8E%A5%E5%8F%A3.md)**：讲解 `IPower` HAL、`IPowerStats` HAL 以及 `/sys/power/` 下的核心节点，理清系统深度休眠的底层软件控制接口。

### 4. 调试方法与实战突破 (Tools & Interview)
* **[14_常用功耗调试命令大全.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/14_%E5%B8%B8%E7%94%A8%E5%8A%9F%E8%80%97%E8%B0%83%E8%AF%95%E5%91%BD%E4%BB%A4%E5%A4%A7%E5%85%A8.md)**：汇集 `dumpsys power`、`dumpsys battery`、`dumpsys deviceidle`、`cmd package` 等百宝箱命令。
* **[15_Perfetto与BatteryHistorian分析方法.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/15_Perfetto%E4%B8%8EBatteryHistorian%E5%88%86%E6%9E%90%E6%96%B9%E6%B3%95.md)**：实战拆解两大核心功耗分析神器。手把手教你利用 Perfetto 查看 CPU 状态分布、抓取 Battery Historian 报告并解析异常耗电源头。
* **[16_典型功耗问题排查案例.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/16_%E5%85%B8%E5%9E%8B%E5%8A%9F%E8%80%97%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5%E6%A1%88%E4%BE%8B.md)**：涵盖“后台 WakeLock 未释放导致不休眠”、“应用高频定时器对齐失败”、“多媒体硬解码与软解码功耗对比”等 3 个真实工业界排查实录。
* **[17_Android功耗工程师面试题.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/17_Android%E5%8A%9F%E8%80%97%E5%B7%A5%E7%A8%8B%E5%B8%88%E9%9D%A2%E8%AF%95%E9%A2%98.md)**：提炼出高频出现的 Framework 层、内核层、应用层功耗经典考题，并附带基于 AOSP 原理的满分回答模板。
* **[18_功耗岗位项目经验包装模板.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/18_%E5%8A%9F%E8%80%97%E5%B2%97%E4%BD%8D%E9%A1%B9%E7%9B%AE%E7%BB%8F%E9%AA%8C%E5%8C%85%E8%A3%85%E6%A8%A1%E6%9D%BF.md)**：提供直接可在简历中复用的“项目描述”、“职责叙述”和“技术难点攻关”话术模板，助力斩获 Offer。

---

## 四、 学习方法与路径推荐

对于不同背景的开发者，我们建议采用不同的研读顺序：

```
                    ┌────────────────────────┐
                    │     Android 全栈功耗    │
                    └───────────┬────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  【应用层优化背景】      【Framework 开发背景】   【系统级与内核背景】
   1. 掌握 07 (耗电统计)   1. 掌握 02 (PMS)         1. 掌握 10 (CPU 调度)
   2. 掌握 11 (Job/Alarm)  2. 掌握 03 (WakeLock)    2. 掌握 04 (系统挂起)
   3. 掌握 05 (Doze/待机)  3. 掌握 05 (Doze)        3. 掌握 13 (HAL/Kernel)
   4. 学会 15 (BatteryH)   4. 搞懂 15/16 (工具实战) 4. 搞懂 09 (温控)
```

1. **动手实践**：功耗是一门极度依赖“动手测”的学科。请配合一台已 Root 且刷入 AOSP 自编译包的手机，一边看文档，一边运行 `14_常用功耗调试命令大全.md` 中介绍的命令，观察手机系统的实时变化。
2. **源码对照**：本文档中的源码剖析基于 **AOSP 14**。如果你在 Linux 环境下，可以通过 `vim` 或 `VS Code` 随时查阅 `/home/suhui/workspace/aosp/los21/frameworks` 中对应的 Java 及 C++ 源文件，以加深理解。

让我们开始这趟硬核的 Android 功耗优化探险之旅！
