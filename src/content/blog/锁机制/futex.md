---
title: futex
date: 2021-01-27 19:00:00
tags:
    - futex
categories:
    - linux内核
slug: "锁机制/futex"
---



## futex 简介

futex (fast userspace mutex) 是Linux的一个基础组件，可以用来构建各种更高级别的同步机制，比如锁或者信号量等等，POSIX信号量就是基于futex构建的。大多数时候编写应用程序并不需要直接使用futex，一般用基于它所实现的系统库就够了。

传统的SystemV IPC(inter process communication)进程间同步机制都是通过内核对象来实现的，以 semaphore 为例，当进程间要同步的时候，必须通过系统调用semop(2)进入内核进行PV操作。系统调用的缺点是开销很大，需要从user mode切换到kernel mode、保存寄存器状态、从user stack切换到kernel stack、等等，通常要消耗上百条指令。事实上，有一部分系统调用是可以避免的，因为现实中很多同步操作进行的时候根本不存在竞争，即某个进程从持有semaphore直至释放semaphore的这段时间内，常常没有其它进程对同一semaphore有需求，在这种情况下，内核的参与本来是不必要的，可是在传统机制下，持有semaphore必须先调用semop(2)进入内核去看看有没有人和它竞争，释放semaphore也必须调用semop(2)进入内核去看看有没有人在等待同一semaphore，这些不必要的系统调用造成了大量的性能损耗。

futex的解决思路是：在无竞争的情况下操作完全在user space进行，不需要系统调用，仅在发生竞争的时候进入内核去完成相应的处理(wait 或者 wake up)。所以说，futex是一种user mode和kernel mode混合的同步机制，需要两种模式合作才能完成，futex本质就是一个位于user space的变量，而不是内核对象，futex的代码也分为user mode和kernel mode两部分，无竞争的情况下在user mode，发生竞争时则通过sys_futex系统调用进入kernel mode进行处理。
但是内核也为了 futex更加健壮，给futex机制增加了好几个syscall:
```
SYSCALL_DEFINE2(set_robust_list, struct robust_list_head __user *, head,
		size_t, len);

SYSCALL_DEFINE3(get_robust_list, int, pid,
		struct robust_list_head __user * __user *, head_ptr,
		size_t __user *, len_ptr);

SYSCALL_DEFINE6(futex, u32 __user *, uaddr, int, op, u32, val,
		const struct __kernel_timespec __user *, utime,
		u32 __user *, uaddr2, u32, val3);

SYSCALL_DEFINE5(futex_waitv, struct futex_waitv __user *, waiters,
		unsigned int, nr_futexes, unsigned int, flags,
		struct __kernel_timespec __user *, timeout, clockid_t, clockid);
```

主要优点是：
+ futex 自身只是userspace的一个变量。
+ 减少了系统调用，只有竞争的情况下回发生系统调用，无竞争的情况下都是用户空间的操作
+ 避免了不必要的上下文切换（导致的TLB失效等）。


## futex userspace 使用案列
在 `test_modules` 中的 `futex_demo` 案列。




### POSIX sema mutex 实现






## 内核部分实现





参考[posix mutex userspace 锁实现](https://pzh2386034.github.io/Black-Jack/pthread/2020/02/08/linux%E9%94%81%E5%AE%9E%E7%8E%B0/)
参考[posix mutex kernelspace 锁实现](https://pzh2386034.github.io/Black-Jack/pthread/2020/02/15/linux%E9%94%81%E5%AE%9E%E7%8E%B0-futex%E5%86%85%E6%A0%B8%E5%AE%9E%E7%8E%B0/)
参考[轻量级的 PI-futex](https://docs.kernel.org/locking/pi-futex.html)
参考[健壮的 robust futex](https://docs.kernel.org/locking/robust-futexes.html)
