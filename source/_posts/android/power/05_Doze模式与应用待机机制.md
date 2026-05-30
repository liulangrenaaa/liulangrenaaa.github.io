# Doze 模式与应用待机机制

随着 Android 系统迭代，单纯依赖底层的休眠锁治理已经不足以应对应用复杂的后台耗电行为。为了进一步延长待机时间，Google 在 Android 6.0 引入了 **Doze 模式（低电耗模式）**，并在后续版本中不断升级；同时引入了 **App Standby（应用待机群组）** 机制。

本节我们将基于 **AOSP 14** 的 `DeviceIdleController` 和 `AppStandbyController`，详解这两大系统级省电大杀器的底层设计与状态运转。

---

## 一、 Doze 模式（低电耗模式）核心机制

Doze 模式的核心思想是：**“当用户长时间不使用手机时，系统应该进入一种深度静默状态，将所有的后台应用打包限制，统一网络和任务调度，只在特定的时间窗口内放行。”**

Doze 模式分为 **深度低电耗模式（Deep Doze）** 和 **轻度低电耗模式（Light Doze）**。

### 1. Deep Doze 状态转移状态机

Deep Doze 的运转依靠 `DeviceIdleController` 内部的状态机进行调度，其核心包含以下 7 种状态：

```
     【屏幕开启 / 充电】 ──> STATE_ACTIVE (活跃态)
                               │  屏幕关闭 且 未充电
                               ▼
                        STATE_INACTIVE (非活跃态)
                               │  开始倒计时
                               ▼
                     STATE_IDLE_PENDING (待决态)
                               │
            ┌──────────────────┴──────────────────┐
            ▼ 移动监测中                           ▼ 静止状态
     STATE_SENSING (感应态)                  STATE_LOCATING (定位态)
            │                                     │
            └──────────────────┬──────────────────┘
                               │ 确认为静止且无定位请求
                               ▼
                       STATE_IDLE (空闲态 - 进入 Deep Doze)
                               │ 周期到期 (如 1 小时)
                      ┌────────┴────────┐
                      ▼                 ▼
          STATE_IDLE_MAINTENANCE    (回到空闲)
             (维护态 - 放行窗口) ───────┘
```

* **`STATE_ACTIVE`**：设备处于亮屏使用中，或者连接着电源。Doze 机制关闭。
* **`STATE_INACTIVE`**：屏幕关闭且拔掉电源。系统开始计时，准备进入低电耗模式。
* **`STATE_IDLE_PENDING`**：过渡状态。系统正准备进入 Doze，停止一些不紧急的后台工作。
* **`STATE_SENSING`**：**关键防御环节**。系统会注册接近传感器或有效运动传感器（Significant Motion Sensor），监测用户是否将手机放入口袋行走。如果检测到运动，立刻退回 `STATE_INACTIVE`。
* **`STATE_LOCATING`**：如果需要，系统会获取一次当前 GPS 位置，作为参考基准。
* **`STATE_IDLE`**：**真正的 Deep Doze**。此时系统拉起屏障（Restrictions），限制所有非白名单应用的后台权限。
* **`STATE_IDLE_MAINTENANCE`**：**维护窗口**。Deep Doze 不会永久持续，否则用户无法收到任何后台推送。每隔一段时间（例如 1小时、2小时、4小时，呈指数级递增），系统会进入维护态，临时放开限制，让应用执行同步（Sync）、Job、发送排队网络包，随后迅速再次拉回 `STATE_IDLE`。

---

### 2. Deep Doze 状态下的限制清单 (Restrictions)
当系统处于 `STATE_IDLE` 时，`DeviceIdleController` 会向全系统广播，触发以下极其严苛的物理限制：
1. **网络拦截**：所有非白名单应用的网络连接均被切断（通过 Linux Netfilter/iptables 防火墙策略）。
2. **忽略 WakeLock**：应用持有的 `PARTIAL_WAKE_LOCK` 自动失效，PMS 不再为其保持 CPU 唤醒。
3. **推迟 Alarm**：普通的 `AlarmManager` 定时器全部被推迟，直到进入 `MAINTENANCE` 窗口才批量唤醒。除非使用 `setAndAllowWhileIdle()` 或 `setExactAndAllowWhileIdle()`（这类即使在 Doze 也会触发，但限制 15 分钟内最多触发一次）。
4. **禁止 Wi-Fi/蓝牙扫描**：防止应用利用高频扫描消耗电量。
5. **推迟 JobScheduler 与 Sync**：所有的 `JobService` 和 `SyncAdapter` 全部挂起。

---

## 二、 轻度低电耗模式（Light Doze）

如果用户灭屏后，拿着手机在路上行走，由于运动传感器被频繁触发，系统无法进入 Deep Doze。为了解决此场景下的耗电，Android 7.0 引入了 **Light Doze**：
* **触发条件**：只要屏幕熄灭且未充电，无需等待设备静止，即可迅速进入。
* **状态机**：只有 `ACTIVE` -> `INACTIVE` -> `IDLE_PENDING` -> `IDLE` -> `WAITING_FOR_NETWORK` -> `MAINTENANCE`。
* **限制程度**：较温和。**不限制 WakeLock，不限制 GPS 定位**，但会拦截不紧急的网络访问，并将一般的 Job 和 Sync 进行周期性推迟。

---

## 三、 Doze 白名单机制 (Power Save Whitelist)

有些应用（如微信、飞书、IM 即时通讯类软件）如果不允许其在 Doze 下联网，用户就会漏掉核心消息。为此，Android 提供了 **电量优化白名单**。

在 `DeviceIdleController.java` 中，白名单分为两层：
* **系统白名单（System Whitelist）**：位于 `/system/etc/sysconfig/` 目录下的 XML 配置文件中，由系统出厂内置（如 Google Play Services 等核心基础组件）。
* **用户白名单（User Whitelist）**：用户在“电池管理 -> 电池优化 -> 不进行优化”中手动勾选的应用。

### 源码解析：白名单判定
在 PMS 或 NetworkPolicyManager 中，常通过 `DeviceIdleController` 提供的本地 Binder 服务进行白名单判定：

```java
// 判断某个 UID 是否在 Doze 白名单内
public boolean isPowerSaveWhitelistApp(String packageName) {
    synchronized (this) {
        return mPowerSaveWhitelistApps.contains(packageName) 
            || mPowerSaveWhitelistUserApps.contains(packageName);
    }
}
```

---

## 四、 应用待机群组 (App Standby Buckets)

Doze 模式是针对**系统全局**的低功耗方案；而 **App Standby** 则是针对**单个应用**活跃度的精细化管控机制，由 `AppStandbyController` 实现。

系统根据应用的**使用频次与最近使用时间**，将每个 App 动态归类到以下 5 个群组（Buckets）之一：

```
 活跃度递减 ───> 限制力度递增
┌─────────────────┬──────────────────┬─────────────────┬─────────────────┬──────────────────┐
│   1. ACTIVE     │  2. WORKING_SET  │   3. FREQUENT   │    4. RARE      │  5. RESTRICTED   │
│   (活跃群组)     │   (工作群组)      │   (常用群组)     │    (极少使用)    │   (受限群组)     │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┼──────────────────┤
│ 用户正在使用，或  │ 应用经常运行，但  │ 应用每天都会运行│ 应用每隔几天运行│ 表现极差，或长期  │
│ 刚打开过该应用   │ 目前没有处于前台  │ 一次，但非高频  │ 一次            │ 未打开，限制极严  │
├─────────────────┼──────────────────┼─────────────────┼─────────────────┼──────────────────┤
│ 没有任何功耗限制│ 稍微延迟 Job 调度 │ 限制 Job 数量；  │ 限制极高，网络和│ 几乎处于半冷冻，  │
│                 │                  │ 每天限制 FCM 推送│ Job 极少执行     │ 仅充电时放行较多  │
└─────────────────┴──────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

### 1. 受限群组（RESTRICTED - Android 12+ 增强）
Android 12 及 14 中，`RESTRICTED` 桶的地位被极大地提高了。若应用在后台持有过多 WakeLock、高频被 Alarm 唤醒、或者占用过多 CPU，`AppStandbyController` 会自动或引导用户将应用打入 `RESTRICTED` 群组。打入后：
* 该应用的后台 Job 每天可能只能执行一次。
* 后台网络被高度拦截。
* 无法拉起大部分后台服务。

---

## 五、 小结与常用调试命令

Doze 和 App Standby 极大地改善了 Android 设备的纯待机续航。在研发和功耗调优中，我们可以通过以下命令强行模拟状态切换以进行功能测试：

* **强行使系统进入 Deep Doze**：
  `adb shell dumpsys deviceidle force-idle deep`
* **查看当前应用所处的 App Standby Bucket**：
  `adb shell am get-standby-bucket <packagename>`

下一章我们将学习与日常续航息息相关的另一个大模块 —— **[06_亮屏灭屏与显示功耗管理.md](file:///home/suhui/workspace/blog/liulangrenaaa.github.io/post_files/android/power/06_%E4%BA%AE%E5%B1%8F%E7%81%AD%E5%B1%8F%E4%B8%8E%E6%98%BE%E7%A4%BA%E5%8A%9F%E8%80%97%E7%AE%A1%E7%90%86.md)**。
