# Alarm与JobScheduler功耗优化

在前面的硬件篇中，我们知道当 SOC 进入休眠状态后，CPU 彻底停摆。但为了让应用程序能在未来的某个时间执行任务（如闹钟响铃、接收推送信标），系统必须提供定时唤醒机制。

Android 主要提供了 **`AlarmManager`** 和 **`JobScheduler`** 两种后台定时器与调度机制。如果在设计应用或定制 ROM 时不加限制，高频的定时唤醒会导致 CPU 无法深睡，电量会在不知不觉中漏光。

本节我们将基于 **AOSP 14**，详解定时器的功耗危害、对齐唤醒（Batching Alarms）原理，以及约束化调度的 Job 功耗优化手段。

---

## 一、 Alarm 闹钟的类型与功耗杀手：`_WAKEUP`

在应用层，通过 `AlarmManager` 注册的闹钟主要分为四种：

```
                              AlarmManager 闹钟
                                      │
         ┌────────────────────────────┴────────────────────────────┐
         ▼                                                         ▼
    【唤醒型闹钟 (_WAKEUP)】                                 【非唤醒型闹钟】
 ├── RTC_WAKEUP                                          ├── RTC
 └── ELAPSED_REALTIME_WAKEUP                             └── ELAPSED_REALTIME
         │                                                         │
         ▼                                                         ▼
 即使 SOC 处于 Deep Suspend，                           仅在系统处于唤醒状态下触发。
 也会通过内核的 alarmtimer 触发                          若系统处于休眠，闹钟被推迟，
 硬件中断（PMIC/RTC），强行唤醒整个系统。                    直到下一次屏幕点亮或有其他
 (功耗消耗巨大！)                                          唤醒事件时才一并执行。 (极其安全)
```

> [!IMPORTANT]
> **功耗优化黄金准则**：在非必要场景下（如周期性的应用日志上传、后台同步），**绝对禁止使用 `_WAKEUP` 类型的闹钟**。一律使用 `ELAPSED_REALTIME` 或者转由 `JobScheduler` 接管。

---

## 二、 唤醒对齐算法：非精确闹钟与批处理 (Batching)

在早期 Android 4.4 之前，所有的闹钟都是精确的，只要时间一到立刻唤醒 CPU。这导致 10 个不同的 App 如果各注册了一个每隔 15 分钟触发的闹钟，CPU 在一个小时内会被零散地唤醒数十次，系统根本无法深睡。

自 Android 4.4 起，Android **默认将所有的普通闹钟都设为“非精确对齐闹钟”**，并在 `AlarmManagerService.java` 中引入了 **对齐批处理（Batching）** 算法。

### 1. 对齐窗口计算
当应用注册一个普通闹钟时，系统不会只记录一个绝对时间点 $T$，而是自动计算出一个**时间段窗口** $[T_{min}, T_{max}]$：

$$\text{最小时间} T_{min} = T$$
$$\text{最大时间} T_{max} = T + \text{windowLength}$$

```
                App 1: [ T1_min  ===========================  T1_max ]
                App 2:               [ T2_min  ===========  T2_max ]
                App 3:                          [ T3_min  =============  T3_max ]
                                         │
                                         ▼ 对齐合并点
                                      【 T_Batch 】
                                  (仅触发一次 CPU 唤醒)
```

`AlarmManagerService` 会遍历当前所有的闹钟，如果发现多个闹钟的 $[T_{min}, T_{max}]$ 窗口存在**交集**，系统就会将它们打包成一个 `Batch`。
当第一个不得不执行的闹钟（到达其 $T_{max}$）迫使系统唤醒时，系统会顺便把处于同一 `Batch` 内、尚未到绝对时间的闹钟**强行一并提前执行**。
通过这种“顺风车”机制，原本零散的 10 次唤醒被合并为 1 次，大幅延长了 CPU 的低功耗深睡时间。

### 2. 精确闹钟的管控政策 (Android 14)
如果应用强制调用 `setExact()` 申请绝对准时的闹钟，系统将无法对其进行对齐优化。
* 在 **Android 14** 中，Google 对精确闹钟（`SCHEDULE_EXACT_ALARM` 权限）进行了进一步压制。
* 大多数后台注册精确闹钟的应用在出厂时默认不再被授予该权限，必须引导用户去设置页面手动开启；否则调用 `setExact()` 会直接抛出 `SecurityException`。

---

## 三、 约束性批处理的王者：`JobScheduler`

相比于野蛮的定时器，**`JobScheduler`** 是 Android Framework 推荐的后台任务执行首选。它的核心逻辑是：**“不要在特定时间干活，而是在最合适的环境下批量干活。”**

```
              ┌──────────────────────────────────────────────┐
              │              JobSchedulerService             │
              └──────────────────────▲───────────────────────┘
                                     │ 注册约束条件 (Constraints)
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  【连接 Wi-Fi】                 【插入充电器】                  【设备空闲 (Idle)】
  (wifi_connected)             (charging_on)                  (device_idle)
        │                            │                            │
        └────────────────────────────┼────────────────────────────┘
                                     │ 所有约束均满足
                                     ▼
                      【统一拉起多个 App 的 Job 执行】
                    (一次性利用高带宽、大电流，效率最高)
```

### 1. 约束条件（Constraints）
开发者可以为 `JobInfo` 设定以下条件，不满足时任务绝对不会运行：
* `setRequiresCharging(boolean)`：是否需要处于充电状态。
* `setRequiredNetworkType(int)`：需要何种网络（例如必须是 Wi-Fi，防止消耗移动流量，且 Wi-Fi 射频功耗比蜂窝网低得多）。
* `setRequiresDeviceIdle(boolean)`：是否需要在设备空闲（如灭屏 Doze）时运行。

### 2. 功耗优势
* **射频唤醒抑制**：无线通信模块（Modem / Wi-Fi）在从休眠到激活（Active）的握手阶段极其耗电。如果多个 App 各自随机联网，射频模块会被频繁拉起。`JobScheduler` 通过约束对齐，在 Wi-Fi 建立后统一处理排队的 Job，让射频芯片在一次工作循环内完成所有数据包发送，最大程度减少了射频唤醒耗电。
* **与 App Standby 完美联动**：`JobSchedulerService` 会动态查询当前应用所属的 App Standby 群组。如果应用处于 `RARE`（极少使用）或 `RESTRICTED`，系统会强行压制其 Job 执行配额，将其合并推迟到最长 24 小时执行一次。

---

## 四、 开发者功耗优化指南

如果你正在优化应用的后台功耗，建议遵循以下改进路线：

| 原始实现 | 替换方案 | 功耗优化效果 |
| :--- | :--- | :--- |
| 使用 `RTC_WAKEUP` 每隔 5 分钟轮询服务器 | 替换为 **FCM（Firebase Cloud Messaging）推送** | 消除后台无谓的 CPU 定时自启唤醒。 |
| 使用 `AlarmManager` 后台启动 `Service` 进行数据同步 | 替换为 **`JobScheduler` 并添加 Wi-Fi + 充电约束** | 零电量损耗，因为只有插着电连 Wi-Fi 才会运行。 |
| 强制使用精确闹钟执行准时上报 | 替换为 **`WorkManager` 非精确任务** | 允许系统自动合并唤醒，大幅减少 CPU 碎片化时间片占用。 |

下一章我们将学习后台功耗的另外三大高频敏感场景 —— **[12_网络定位蓝牙传感器功耗场景.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/12_%E7%BD%91%E7%BB%9C%E5%AE%9A%E4%BD%8D%E8%93%9D%E7%89%99%E4%BC%A0%E6%84%9F%E5%99%A8%E5%8A%9F%E8%80%97%E5%9C%BA%E6%99%AF.md)**。
