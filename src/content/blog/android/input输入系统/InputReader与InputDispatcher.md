---
title: InputReader与InputDispatcher
date: 2024-07-01 10:00:00
tags:
    - android
    - input
    - InputReader
    - InputDispatcher
categories:
    - android
    - input输入系统
slug: "android/input输入系统/InputReader与InputDispatcher"
---


## 简介

InputReader 和 InputDispatcher 是 Android 输入系统的两个核心组件，分别负责读取和分发输入事件。

## InputReader

### 职责
- 从 InputDevice 读取原始事件
- 将原始事件转换为 Android 输入事件
- 通过 InputDispatcher 分发事件

### 工作流程
```
EventHub.getEvents()
    → InputReader.loopOnce()
    → processEventsLocked()
    → 将事件放入 InboundQueue
```

### 设备类型
| 类型 | 说明 |
|------|------|
| AKEY_EVENT_TYPE | 按键事件 |
| AMOTION_EVENT_TYPE | 触摸事件 |

## InputDispatcher

### 职责
- 从 InboundQueue 获取事件
- 查找目标窗口
- 将事件发送到目标窗口
- 处理 ANR 超时

### 工作流程
```
dispatchOnce()
    → dispatchOnceInnerLocked()
    → dispatchMotionLocked() / dispatchKeyLocked()
    → findTouchedWindowLocked() / findFocusedWindowLocked()
    → dispatchEventLocked()
    → 通过 InputChannel 发送
```

## 事件队列

```
Hardware → EventHub → InputReader → InboundQueue → InputDispatcher → OutboundQueue → InputChannel → App
```

## 关键类

| 类名 | 职责 |
|------|------|
| EventHub | 读取内核输入事件 |
| InputDevice | 输入设备抽象 |
| InputChannel | 进程间通信通道 |
| InputWindowInfo | 窗口信息 |

## ANR 检测

InputDispatcher 负责检测输入事件 ANR：
1. 事件发送后启动超时计时
2. 如果 5s 内未收到完成通知，触发 ANR

## 总结

InputReader 负责读取和转换输入事件，InputDispatcher 负责分发事件到目标窗口，两者协同完成输入事件的处理。
