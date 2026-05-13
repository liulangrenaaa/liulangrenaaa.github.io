---
title: Android消息机制(四)：Vsync 信号与 UI 刷新 (vsyncfd)
date: 2026-05-13 21:15:03
categories:
  - Android
  - Framework基础
tags:
  - Vsync
  - Choreographer
  - 同步屏障
---

# Android消息机制(四)：Vsync 信号与 UI 刷新 (vsyncfd)

## 1. 概述
UI 的每一帧刷新都由 Vsync 信号驱动，而这个信号也是通过 Looper 的 epoll 机制分发的。

## 2. Choreographer 与 DisplayEventReceiver
- `vsyncfd`: 监听 SurfaceFlinger 的节奏。
- 为什么 Vsync 是被动接收而不是主动轮询？

## 3. 同步屏障 (Sync Barrier)
- 为什么需要屏障？
- 异步消息 (Asynchronous Message) 如何在渲染时“插队”。

## 4. Vsync 到达后的执行序列
1. Input
2. Animation
3. Traversal (Measure, Layout, Draw)

## 5. 待补充内容
- [ ] `MessageQueue.postSyncBarrier()` 的源码实现。
- [ ] 从 SurfaceFlinger 到 App 进程的 Vsync 传递路径。
