---
title: Input-ANR机制
date: 2024-09-01 10:00:00
tags:
    - android
    - input
    - ANR
    - 稳定性
categories:
    - android
    - input输入系统
---

## 简介

Input ANR 是指应用在规定时间内未能处理完输入事件，系统会弹出 ANR 对话框或杀掉进程。

## ANR 类型

| 类型 | 超时时间 | 说明 |
|------|----------|------|
| Key Dispatch Timeout | 5s | 按键事件超时 |
| Motion Dispatch Timeout | 5s | 触摸事件超时 |

## ANR 检测流程

### 1. 事件发送
```
InputDispatcher.dispatchEvent()
    → 事件发送到 InputChannel
    → 事件进入 WaitQueue
    → 启动超时计时
```

### 2. 超时检测
```
InputDispatcher.dispatchOnce()
    → 检查 WaitQueue
    → 发现超时事件
    → 触发 onAnr()
```

### 3. ANR 处理
```
InputManagerService.notifyAnr()
    → AMS.inputDispatchingTimedOut()
    → 弹出 ANR 对话框
```

## ANR 原因分析

### 1. 主线程阻塞
```
主线程执行耗时操作
    → 无法处理输入事件
    → WaitQueue 超时
    → ANR
```

### 2. InputChannel 阻塞
```
InputChannel 满
    → 事件无法发送
    → OutboundQueue 堆积
    → ANR
```

### 3. Binder 阻塞
```
主线程 Binder 调用
    → 等待远端响应
    → 无法处理事件
    → ANR
```

## 调试方法

### 1. 查看 traces
```bash
adb pull /data/anr/traces.txt
```

### 2. 查看 Input 状态
```bash
adb shell dumpsys input
```

### 3. 查看 CPU 使用
```bash
adb shell top -m 10
```

## ANR 日志分析

```
Input dispatching timed out (xxx)
    → 窗口名称
    → 超时时间
    → 事件类型
```

## 预防措施

1. **避免主线程耗时操作**
2. **及时处理输入事件**
3. **优化布局复杂度**
4. **减少 Binder 调用**

## 总结

Input ANR 是应用响应性的重要指标，理解 ANR 机制有助于快速定位和解决性能问题。
