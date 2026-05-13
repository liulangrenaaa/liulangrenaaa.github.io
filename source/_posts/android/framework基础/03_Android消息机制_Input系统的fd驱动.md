---
title: Android消息机制(三)：Input 系统如何“白嫖” Looper (inputfd)
date: 2026-05-13 21:15:02
categories:
  - Android
  - Framework基础
tags:
  - Input
  - socketpair
  - 多路复用
---

# Android消息机制(三)：Input 系统如何“白嫖” Looper (inputfd)

## 1. 概述
Input 系统并不直接发送 Handler 消息，而是通过 `socketpair` 将事件直接注入 Looper 的 epoll 池中。

## 2. InputChannel 的本质
- 基于 `socketpair` 的全双工通信。
- Client 端和 Server 端的 FDs 分别代表什么？

## 3. 注册到 Looper
- `addFd`: Looper 如何监听非消息类的文件描述符。
- `handleEvent` 回调机制。

## 4. socketpair vs eventfd
- 为什么 Input 使用 `socketpair` 而不是 `eventfd`？（需要传输数据包结构体）。

## 5. 待补充内容
- [ ] `InputPublisher` 与 `InputConsumer` 的交互流程。
- [ ] UI 线程如何感知到屏幕触摸的第一时间响应。
