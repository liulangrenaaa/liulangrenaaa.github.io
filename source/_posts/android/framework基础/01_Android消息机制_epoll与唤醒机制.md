---
title: Android消息机制(一)：Looper的心脏——epoll与唤醒机制
date: 2026-05-13 10:15:00
categories:
  - android
  - framework基础
tags:
  - Looper
  - epoll
  - 源码分析
---

# Android消息机制(一)：Looper的心脏——epoll与唤醒机制

## 1. 概述
Android 的消息机制不仅是 Java 层的 Handler，其核心动力源于 Native 层的 `epoll` 机制。

## 2. nativePollOnce 与 nativeWake
- **nativePollOnce**: 为什么这个方法会阻塞？
- **nativeWake**: 它是如何叫醒正在“睡觉”的线程的？

## 3. 从 pipe 到 eventfd
- 早期版本的实现方式：`pipe`。
- 现代版本的优化：`eventfd`。
- 为什么选择 `eventfd`？（内存开销与效率）。

## 4. 关键源码路径
- `frameworks/base/core/java/android/os/MessageQueue.java`
- `frameworks/base/core/jni/android_os_MessageQueue.cpp`
- `system/core/libutils/Looper.cpp`

## 5. 待补充内容
- [ ] epoll_create/epoll_ctl/epoll_wait 的具体调用流程。
- [ ] eventfd 的计数器逻辑。
