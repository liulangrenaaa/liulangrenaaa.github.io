---
title: QCOM平台功耗实战：以Mi MIX 2 msm8998为例
date: 2026-05-31 11:11:00
tags:
    - android
    - power
    - qcom
    - msm8998
    - case
categories:
    - android
    - power
---

## 设备信息

外接设备：

```text
model: Mi MIX 2
device: chiron
Android: 14
hardware: qcom
board: msm8998
soc: MSM8998
adb: root
```

这是一个很适合做功耗学习的老 QCOM 平台：节点可见度高、`adb root` 可用，同时又能看到老平台和现代 AOSP 的差异。

## 初始基线

```bash
adb devices -l
adb shell getprop ro.product.model
adb shell getprop ro.hardware
adb shell getprop ro.product.board
adb shell dumpsys battery
adb shell dumpsys power
adb shell dumpsys thermalservice
```

观察：

```text
USB powered: true
level: 100
status: Full
temperature: 37.0 C
mWakefulness=Awake
mIsPowered=true
mPlugType=2
mStayOn=true
Thermal HAL Ready=false
```

第一条结论：当前插 USB 调试状态不能直接当自然待机功耗数据。

## CPU平台特征

```bash
adb shell cat /sys/devices/system/cpu/cpufreq/policy*/scaling_governor
adb shell cat /sys/devices/system/cpu/cpufreq/policy*/scaling_cur_freq
```

观察：

```text
policy0: interactive, max 1900800
policy4: interactive, max 2361600
```

这说明分析 CPU 功耗时要关注 interactive governor 和 vendor boost，而不是只按现代 schedutil/EAS 的思路套。

## Thermal HAL缺失case

`dumpsys thermalservice`：

```text
Thermal Status: 0
Cached temperatures:
HAL Ready: false
```

但 sysfs 仍可读：

```bash
adb shell cat /sys/class/thermal/thermal_zone*/type
adb shell cat /sys/class/thermal/thermal_zone*/temp
adb shell cat /sys/class/thermal/cooling_device*/type
adb shell cat /sys/class/thermal/cooling_device*/cur_state
```

观察到：

```text
battery
pm8998_tz
pmi8998_tz
pm8005_tz
msm_therm
tsens_tz_sensor*
thermal-cpufreq-0
thermal-cpufreq-1
```

case结论：

```text
Framework thermalservice不可用时，不能据此判断设备无热限制。
需要转向Kernel thermal_zone和cooling_device观察温度与限制动作。
```

## wakeup_sources观察

```bash
adb shell cat /sys/kernel/debug/wakeup_sources
```

当前能看到 QCOM 相关链路：

```text
hal_bluetooth_lock
Loc_hal
lowi-server
netmgrd
DataModule
qti
```

后续可以造这些 case：

| case | 对比方式 |
|------|----------|
| 蓝牙唤醒 | 蓝牙开/关，对比 `hal_bluetooth_lock` |
| 定位唤醒 | 定位开/关，对比 `Loc_hal`、`lowi-server` |
| 蜂窝唤醒 | 飞行模式开/关，对比 `netmgrd`、`DataModule` |
| Wi-Fi唤醒 | Wi-Fi开/关，对比 wlan/lowi 相关项 |

注意：只看到名字不代表有问题，要看 delta。

## 下一步实战计划

### Case 1：USB状态对待机测试的影响

目标：证明插 USB 时 `mIsPowered`、`mStayOn`、充电状态会改变测试条件。

采集：

```bash
adb shell dumpsys power
adb shell dumpsys battery
```

### Case 2：Thermal HAL不可用时如何分析热

目标：从 thermal_zone 和 cooling_device 建立热分析链路。

采集：

```bash
adb shell dumpsys thermalservice
adb shell cat /sys/class/thermal/thermal_zone*/type
adb shell cat /sys/class/thermal/thermal_zone*/temp
adb shell cat /sys/class/thermal/cooling_device*/type
adb shell cat /sys/class/thermal/cooling_device*/cur_state
```

### Case 3：定位/蓝牙/网络 wakeup source 对比

目标：通过开关变量观察 wakeup source delta。

采集：

```bash
adb shell cat /sys/kernel/debug/wakeup_sources > before.txt
# 开关变量，等待固定时间
adb shell cat /sys/kernel/debug/wakeup_sources > after.txt
```

## 实战原则

- 先记录限制条件，不粉饰数据。
- 每次只改一个变量。
- 对比 delta，不看单次绝对值。
- Framework、sysfs、Perfetto 能互相解释才写结论。
