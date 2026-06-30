---
title: Service-ANR分析方法
date: 2025-04-15 10:00:00
tags:
    - android
    - ANR
    - Service
    - 稳定性
categories:
    - android
    - anr-crash稳定性
slug: "android/anr-crash稳定性/Service-ANR分析方法"
---


## 简介

Service ANR 是指 Service 的生命周期方法在规定时间内未完成，本文介绍 Service ANR 的分析方法。

## 超时时间

| Service 类型 | 超时时间 |
|--------------|----------|
| 前台 Service | 20s |
| 后台 Service | 200s |

## 触发流程

```
ActiveServices.realStartServiceLocked()
    → 发送 SERVICE_TIMEOUT_MSG
    → Service 开始执行
    → 超时未完成
    → serviceTimeout()
    → 触发 ANR
```

## 日志分析

### 1. EventLog
```
am_anr: [0,进程ID,包名,executing service xxx/xxx]
```

### 2. SystemLog
```
Timeout executing service: ServiceRecord{xxx}
```

### 3. traces.txt
```
"main" prio=5 tid=1 Blocked
    at com.example.app.MyService.onStartCommand(MyService.java:50)
```

## 分析步骤

### 1. 确认 Service 类型
- 前台还是后台
- 超时时间是多少

### 2. 查看主线程状态
```bash
grep -A 20 "\"main\"" /data/anr/traces.txt
```

### 3. 分析执行耗时
- onStartCommand 耗时
- onBind 耗时
- 其他生命周期方法耗时

## 常见场景

### 1. 主线程阻塞
```
"main" tid=1 Blocked
    at com.example.app.MyService.onStartCommand(MyService.java:50)
```

### 2. 数据库操作
```
"main" tid=1 Native
    at android.database.sqlite.SQLiteDatabase.rawQuery(Native Method)
```

### 3. 网络请求
```
"main" tid=1 Native
    at java.net.SocketInputStream.read(Native Method)
```

## 调试命令

### 查看 Service 状态
```bash
adb shell dumpsys activity services
```

### 查看进程状态
```bash
adb shell dumpsys activity processes
```

## 预防措施

1. 避免在生命周期方法中执行耗时操作
2. 使用 IntentService 或 JobIntentService
3. 将耗时操作移到后台线程
4. 监控 Service 执行时间

## 总结

Service ANR 分析关键是查看主线程状态和 Service 执行耗时，优化 Service 实现避免阻塞。
