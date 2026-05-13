---
title: InputChannel与事件分发
date: 2024-08-01 10:00:00
tags:
    - android
    - input
    - InputChannel
    - 事件分发
categories:
    - android
    - input输入系统
---

## 简介

InputChannel 是 Android 输入系统中进程间通信的通道，负责将输入事件从 system_server 传递到应用进程。

## InputChannel 结构

### 组成
- **Server 端**：位于 system_server，用于发送事件
- **Client 端**：位于应用进程，用于接收事件

### 创建时机
```
WMS.addWindow()
    → InputChannel.openInputChannelPair()
    → 注册到 InputDispatcher
```

## 事件分发流程

### Server 端（InputDispatcher）
```
InputDispatcher.dispatchEvent()
    → InputPublisher.publishMotionEvent()
    → 通过 Socket 发送事件
```

### Client 端（应用进程）
```
InputConsumer.consume()
    → InputEventReceiver.onInputEvent()
    → ViewRootImpl.enqueueInputEvent()
    → 处理事件
```

## 事件处理流程

```
ViewRootImpl.processInputEvent()
    → deliverInputEvent()
    → InputStage.deliver()
    → View.postIme()
    → Activity.dispatchTouchEvent()
    → ViewGroup.dispatchTouchEvent()
    → View.onTouchEvent()
```

## 事件完成通知

```
App 处理完成
    → InputConsumer.sendFinishedSignal()
    → InputDispatcher.handleReceiveCallback()
    → 更新 ANR 计时
```

## 双通道机制

每个窗口有两个 InputChannel：
1. **InputChannel**：用于事件分发
2. **InputChannel**：用于完成通知

## 性能优化

1. **减少事件处理时间**：避免在主线程执行耗时操作
2. **批量处理**：合并多个事件一起处理
3. **异步处理**：将耗时操作移到后台线程

## 总结

InputChannel 是输入事件跨进程传递的核心机制，通过 Socket 实现高效的数据传输。
