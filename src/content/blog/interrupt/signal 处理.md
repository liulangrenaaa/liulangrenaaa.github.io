---
title: signal 处理
date: 2023-03-01 19:00:40
tags:
    - signal
categories:
    - linux内核
slug: "interrupt/signal-处理"
---















## 什么是 signal?
信号的基本使用场景：使用 ctrl+c 中止一个程序，或者使用 kill pid 命令杀掉一个进程。
Linux 信号机制很多人都听过，但是信号的具体实现机制还是有很多人不清楚的。
在很多人的概念中信号是一种异步机制，类似中断。但是signal 是全软件模拟的中断。



## 数据结构










## signal 响应

什么时候响应signal? 类比硬件中断的话，只要不屏蔽硬件中断，没有硬件中断正在执行，硬件中断应该会立即响应。
但是signal 由于是软件模拟的，出于吞吐率的考量等，signal 不能打断正在执行的进程。

所以被signal 通知的signal进程什么时候会去处理这个signal呢？linux 中是在用户态中断返回userspace时 or
系统调用返回userspace中时。
当然 signal 也会被屏蔽，linux中 使用的是 TASK_UNINTERRUPTIBLE 来屏蔽 signal 的处理，如果task在内核中处于 TASK_INTERRUPTIBLE 也不会屏蔽 signal。



exit_to_user_mode --> prepare_exit_to_user_mode --> do_notify_resume --> do_signal --> handle_signal




### 被signal通知的进程如果在 kernel space中
这种情况: 线程 在kernel_space中，可能处于
__send_signal_locked() -> complete_signal() -> signal_wake_up() -> signal_wake_up_state()













参考[Linux Signal](https://kernel.meizu.com/linux-signal.html)