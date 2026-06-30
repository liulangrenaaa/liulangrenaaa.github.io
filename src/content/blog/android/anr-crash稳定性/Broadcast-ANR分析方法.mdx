---
title: Broadcast-ANR分析方法
date: 2025-05-01 10:00:00
tags:
    - android
    - ANR
    - Broadcast
    - 稳定性
categories:
    - android
    - anr-crash稳定性
slug: "android/anr-crash稳定性/Broadcast-ANR分析方法"
---


## 简介

Broadcast ANR 是指 BroadcastReceiver 在规定时间内未完成处理，本文介绍 Broadcast ANR 的分析方法。

## 超时时间

| 广播类型 | 超时时间 |
|----------|----------|
| 前台广播 | 10s |
| 后台广播 | 60s |

## 触发流程

```
BroadcastQueue.processNextBroadcastLocked()
    → 发送 BROADCAST_TIMEOUT_MSG
    → BroadcastReceiver 开始处理
    → 超时未完成
    → broadcastTimeout()
    → 触发 ANR
```

## 日志分析

### 1. EventLog
```
am_anr: [0,进程ID,包名,Broadcast of Intent { act=xxx }]
```

### 2. SystemLog
```
Timeout of broadcast xxx
```

### 3. traces.txt
```
"main" prio=5 tid=1 Blocked
    at com.example.app.MyReceiver.onReceive(MyReceiver.java:30)
```

## 分析步骤

### 1. 确认广播类型
- 前台还是后台
- 超时时间是多少

### 2. 查看广播队列状态
```bash
adb shell dumpsys activity broadcasts
```

### 3. 查看主线程状态
```bash
grep -A 20 "\"main\"" /data/anr/traces.txt
```

## 常见场景

### 1. 主线程阻塞
```
"main" tid=1 Blocked
    at com.example.app.MyReceiver.onReceive(MyReceiver.java:30)
```

### 2. 广播队列积压
- 大量广播同时到达
- 处理速度跟不上

### 3. 有序广播阻塞
- 前一个接收器处理慢
- 阻塞后续接收器

## 调试命令

### 查看广播队列
```bash
adb shell dumpsys activity broadcasts
```

### 查看广播历史
```bash
adb shell dumpsys activity broadcasts history
```

## 预防措施

1. 避免在 onReceive 中执行耗时操作
2. 使用 goAsync() 处理异步操作
3. 优化广播接收器的实现
4. 避免注册过多的广播接收器

## 总结

Broadcast ANR 分析关键是查看广播队列状态和主线程状态，优化广播接收器实现避免阻塞。
