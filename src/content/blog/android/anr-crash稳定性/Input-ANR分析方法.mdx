---
title: Input-ANR分析方法
date: 2025-04-01 10:00:00
tags:
    - android
    - ANR
    - Input
    - 稳定性
categories:
    - android
    - anr-crash稳定性
slug: "android/anr-crash稳定性/Input-ANR分析方法"
---


## 简介

Input ANR 是指应用在 5 秒内未能处理完输入事件，本文介绍 Input ANR 的分析方法。

## ANR 类型

| 类型 | 超时时间 | 说明 |
|------|----------|------|
| Key Dispatch Timeout | 5s | 按键事件超时 |
| Motion Dispatch Timeout | 5s | 触摸事件超时 |

## 日志分析

### 1. EventLog
```
am_anr: [0,进程ID,包名,原因]
```

### 2. SystemLog
```
Input dispatching timed out (xxx)
```

### 3. traces.txt
```
"main" prio=5 tid=1 Blocked
    at com.example.app.MainActivity.onClick(MainActivity.java:100)
    - waiting to lock <0x00000000> (java.lang.Object) held by thread 15
```

## 分析步骤

### 1. 查看主线程状态
```bash
grep -A 20 "\"main\"" /data/anr/traces.txt
```

### 2. 分析阻塞原因
- Blocked：等待锁
- Waiting：等待唤醒
- Runnable：CPU 密集

### 3. 查找锁持有者
```bash
grep "held by thread" /data/anr/traces.txt
```

## 常见场景

### 1. 主线程耗时操作
```
"main" prio=5 tid=1 Runnable
    at com.example.app.MainActivity.onReceive(MainActivity.java:100)
```

### 2. 死锁
```
"main" tid=1 Blocked
    waiting to lock held by thread 15
"thread-15" tid=15 Blocked
    waiting to lock held by thread 1
```

### 3. Binder 阻塞
```
"main" tid=1 Native
    at android.os.BinderProxy.transactNative(Native Method)
```

## 调试命令

### 查看 Input 状态
```bash
adb shell dumpsys input
```

### 查看窗口焦点
```bash
adb shell dumpsys window | grep -i focus
```

### 查看 CPU 使用
```bash
adb shell top -m 10
```

## 预防措施

1. 避免主线程执行耗时操作
2. 优化锁的使用
3. 减少 Binder 调用
4. 监控 Input 队列状态

## 总结

Input ANR 分析关键是查看主线程状态和阻塞原因，结合日志和 traces 定位问题根源。
