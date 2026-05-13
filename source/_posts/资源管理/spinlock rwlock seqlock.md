---
title: spinlock rwlock seqlock
date: 2023-02-2 19:00:00
tags:
    - spinlock
    - rwlock
    - seqlock
    - 锁机制
categories:
    - linux内核
---


## 简介
`spinlock`、`rwlock`、`seqlock` 这三种锁本质都还是 spinlock




## spinlock

spinlock 经历了很多代的发展
+ UP 架构下：
很久之前，由于半导体工艺和设计架构限制，SOC大多数还都是单核，此时只需要关闭抢占即可

+ SMP 架构下：
1. wild spinlock  : 在cpu core变多的情况下会导致，等待获取spinlock的几率完全是随机的，但也不完全随机，会受到 cpu core之间的距离，cluster 架构的影响(cache coreherency)，可能会导致某个cpu 在很早就开始等待申请 spinlock，但是可能一直无法获取 spinlock，导致cpu上的任务饿死了。
2. ticket spinlock: 和火锅店吃饭一样，先到的人取号等待，后到的人也会取号，号码递增，等前面的cpu释放spinlock，ticket会递增。然后sev唤醒所有等待的cpu，等待spinlock的cpu会将本地spinlock的owner与tick比较，一致的话就获取spinlock，不一致的话就继续等待。
但是这里存在两个问题，首先在cpu core达到128甚至更多的系统中，每个等待spin_lock的cpu都在 ticket 上spin，都会在本地的cache上有一份副本，这样导致在任何一个cpu释放spinlock的情况下所有cpu的本地cache副本ticket变量都会无效，然后更新ticket 变量有效值。ticket变量在所有cpu的cache中来回颠簸，降低了带宽。
另一个问题是在一个cpu释放spinlock然后更新ticket之后，需要唤醒系统中`所有`其他cpu，加入释放spinlock的cpu能准确知道去唤醒哪个cpu，这样可以避免唤醒正在wfe的cpu core，降低系统功耗。
3. queued spinlock       : ticket spinlock 解决了可能的spinlock的公平性问题，但是还存在 1. cache颠簸带宽下降 2. 不应该唤醒的cpu core频繁唤醒的问题，而 queued spinlock就是来解决这个问题的。


在arm64 中， LDREX 和 STREX是实现 spinlock的关键，是strex ldrex 保证了资源独占性访问。












参考[spinlock前世今生](https://zhuanlan.zhihu.com/p/133445693)
参考[Use of WFE and SEV instructions by spin-locks](https://developer.arm.com/documentation/ddi0406/c/Application-Level-Architecture/Application-Level-Memory-Model/Synchronization-and-semaphores/Use-of-WFE-and-SEV-instructions-by-spin-locks)
参考[Spinlock implementation in ARM architecture](https://linux-concepts.blogspot.com/2018/05/spinlock-implementation-in-arm.html)



## rwlock











































## seqlock

















































https://zhuanlan.zhihu.com/p/356457430