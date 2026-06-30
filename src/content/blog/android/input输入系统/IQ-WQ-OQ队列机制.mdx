---
title: IQ-WQ-OQ队列机制
date: 2024-08-15 10:00:00
tags:
    - android
    - input
    - 队列
    - 性能
categories:
    - android
    - input输入系统
slug: "android/input输入系统/IQ-WQ-OQ队列机制"
---


## 简介

Android 输入系统使用多个队列来管理输入事件，主要包括 InboundQueue (IQ)、WaitQueue (WQ) 和 OutboundQueue (OQ)。

## 队列结构

### InboundQueue (IQ)
- 存储从 InputReader 接收的事件
- 按时间顺序排列
- 等待 InputDispatcher 处理

### OutboundQueue (OQ)
- 存储等待发送到应用的事件
- 按窗口分组
- 等待 InputChannel 可写

### WaitQueue (WQ)
- 存储已发送但未确认的事件
- 等待应用处理完成
- 用于 ANR 检测

## 事件流转

```
InputReader
    ↓
InboundQueue (IQ)
    ↓ 分发
OutboundQueue (OQ)
    ↓ 发送
InputChannel
    ↓
WaitQueue (WQ)
    ↓ 完成通知
移除
```

## 队列状态

### 正常情况
```
IQ → OQ → WQ → 移除
```

### 阻塞情况
```
IQ → OQ (满) → 阻塞
WQ (超时) → ANR
```

## ANR 触发条件

### WaitQueue 超时
```
事件进入 WQ
    → 启动 5s 计时
    → 超时未收到完成通知
    → 触发 Input ANR
```

### OutboundQueue 阻塞
```
OQ 满
    → 无法发送新事件
    → IQ 堆积
    → 触发 ANR
```

## 调试方法

### 查看队列状态
```bash
adb shell dumpsys input
```

### 关键信息
- IQ 大小：待处理事件数
- OQ 大小：待发送事件数
- WQ 大小：待确认事件数

## 性能优化

1. **减少事件积压**：及时处理事件
2. **避免阻塞**：不要在事件处理中执行耗时操作
3. **监控队列**：定期检查队列状态

## 总结

IQ、OQ、WQ 三个队列协同工作，保证输入事件的有序处理，队列状态异常可能导致 ANR。
