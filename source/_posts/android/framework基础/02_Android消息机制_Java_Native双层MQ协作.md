---
title: Android消息机制(二)：双层 MessageQueue 的并发与调度逻辑
date: 2026-05-13 21:15:01
categories:
  - Android
  - Framework基础
tags:
  - MessageQueue
  - Native
  - 调度
---

# Android消息机制(二)：双层 MessageQueue 的并发与调度逻辑

## 1. 概述
MessageQueue 在 Android 中其实存在“双胞胎”：Java 层一套，Native 层也有一套。

## 2. Java 层 mMessages 链表
- 按时间顺序排列的消息队列。
- `MessageQueue.next()` 的出队逻辑。

## 3. Native 层 Looper 消息
- `Looper.cpp` 中的 `mMessageEnvelopes`。
- Native 层也有 `sendMessageDelay`。

## 4. 优先级博弈
当 `epoll_wait` 返回时：
1. 先处理 Native 层的 `Response`。
2. 再处理 Native 层的 `Message`。
3. 最后回到 Java 层处理 `mMessages`。

## 5. 待补充内容
- [ ] `pollInner` 函数的详细源码拆解。
- [ ] 为什么 Native 层的消息优先级更高？
