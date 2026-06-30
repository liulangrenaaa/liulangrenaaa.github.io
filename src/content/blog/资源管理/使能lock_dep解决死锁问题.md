---
title: 使能lock_dep解决死锁问题
date: 2021-01-23 19:00:00
tags:
    - deadlock
    - lockdep
categories:
    - linux内核
slug: "资源管理/使能lock_dep解决死锁问题"
---


lockdep 就是 `lock dependencies` 缩写，翻译是 `锁依赖`。

## 如何使能 lockdep

在 `make menuconfig` 使能 `lockdep` 之后，会自动增加如下配置
```
	echo "CONFIG_LOCKUP_DETECTOR=y" >> /tmp/.config
	echo "CONFIG_SOFTLOCKUP_DETECTOR=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_SOFTLOCKUP_PANIC=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_SOFTLOCKUP_PANIC_VALUE=1" >> /tmp/.config
	echo "CONFIG_HARDLOCKUP_DETECTOR_PERF=y" >> /tmp/.config
	echo "CONFIG_HARDLOCKUP_DETECTOR=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_HARDLOCKUP_PANIC=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_HARDLOCKUP_PANIC_VALUE=1" >> /tmp/.config
```
配置之后重新编译运行，会发现在 `/proc/lockdep` 目录下多出几个文件
```
/proc/sys/kernel/lock_stat--------置位则可以查看/proc/lock_stat统计信息，清楚则关闭lockdep统计信息。
/proc/sys/kernel/max_lock_depth---
/proc/sys/kernel/prove_locking
/proc/locks
/proc/lock_stat-------------------关于锁的使用统计信息
/proc/lockdep---------------------存在依赖关系的锁
/proc/lockdep_stats---------------存在依赖关系锁的统计信息
/proc/lockdep_chains--------------依赖关系锁链表
```

## lockdep 原理
常见的死锁有如下两种：
1. 递归死锁：中断等延迟操作中使用了锁，和外面的锁构成了递归死锁。
2. AB-BA死锁：多个锁因处理不当而引发死锁，多个内核路径上的所处理顺序不一致也会导致死锁。

Linux内核提供死锁调试模块Lockdep，跟踪每个锁的自身状态和各个锁之间的依赖关系，经过一系列的验
证规则来确保锁之间依赖关系是正确的。

先看代码注释
```
/*
 * this code maps all the lock dependencies as they occur in a live kernel
 * and will warn about the following classes of locking bugs:
 *
 * - lock inversion scenarios
 * - circular lock dependencies
 * - hardirq/softirq safe/unsafe locking bugs
 *
 * Bugs are reported even if the current locking scenario does not cause
 * any deadlock at this point.
 *
 * I.e. if anytime in the past two locks were taken in a different order,
 * even if it happened for another task, even if those were different
 * locks (but of the same class as this lock), this code will detect it.
 */
```
翻译就是可以解决如下的问题
1. 锁定反转方案 -- ABBA
2. 循环锁依赖性 -- 递归锁
3. hardirq / softirq安全/不安全的锁定错误


## lockdep 案例
写了一个`ABBA型` 基于 spinlock的 deadlock demo。参考 [代码](https://github.com/liulangrenaaa/test_modules/blob/main/lock_race/lockdep_test/lockdep_test.c)
其实这个demo 会触发多个问题
1. deadlock 被检测出来。
2. 由于是基于 `spinlock` 的，所以在等待lock的时候一直处于`spin`，导致 `rcu stall`
3. 等待 `20s` 之后，由于基于 `spinlock`的，所以两个cpu一直未调度，发生 `soft lockup`，然后 panic.

编译安装之后，kmsg 显示如下问题：
```
[  147.475517] lockdep_test: loading out-of-tree module taints kernel.
[  157.769995]
[  157.770640] ======================================================
[  157.770683] WARNING: possible circular locking dependency detected
[  157.770683] 5.11.0-rc4+ #5 Tainted: G           O
[  157.770683] ------------------------------------------------------
[  157.770683] krace_0/3755 is trying to acquire lock:
[  157.770683] ffffffffc0527468 (&g_lockdep_test.lock_A){+.+.}-{2:2}, at: klockdep_test_BA+0x2e/0x80 [lockdep_test]
[  157.770683]
               but task is already holding lock:
[  157.770683] ffffffffc05274a8 (&g_lockdep_test.lock_B){+.+.}-{2:2}, at: klockdep_test_BA+0x18/0x80 [lockdep_test]
[  157.770683]
               which lock already depends on the new lock.

[  157.770683]
               the existing dependency chain (in reverse order) is:
[  157.770683]
               -> #1 (&g_lockdep_test.lock_B){+.+.}-{2:2}:
[  157.770683]        _raw_spin_lock+0x27/0x40
[  157.770683]        klockdep_test_AB+0x2e/0x80 [lockdep_test]
[  157.770683]        kthread+0x10a/0x140
[  157.770683]        ret_from_fork+0x22/0x30
[  157.770683]
               -> #0 (&g_lockdep_test.lock_A){+.+.}-{2:2}:
[  157.770683]        __lock_acquire+0x139e/0x28a0
[  157.770683]        lock_acquire+0xbd/0x360
[  157.770683]        _raw_spin_lock+0x27/0x40
[  157.770683]        klockdep_test_BA+0x2e/0x80 [lockdep_test]
[  157.770683]        kthread+0x10a/0x140
[  157.770683]        ret_from_fork+0x22/0x30
[  157.770683]
               other info that might help us debug this:

[  157.770683]  Possible unsafe locking scenario:

[  157.770683]        CPU0                    CPU1
[  157.770683]        ----                    ----
[  157.770683]   lock(&g_lockdep_test.lock_B);
[  157.770683]                                lock(&g_lockdep_test.lock_A);
[  157.770683]                                lock(&g_lockdep_test.lock_B);
[  157.770683]   lock(&g_lockdep_test.lock_A);
[  157.770683]
                *** DEADLOCK ***
[  157.770683] 1 lock held by krace_0/3755:
[  157.770683]  #0: ffffffffc05274a8 (&g_lockdep_test.lock_B){+.+.}-{2:2}, at: klockdep_test_BA+0x18/0x80 [lockdep_test]
[  157.770683]
               stack backtrace:
[  157.770683] CPU: 1 PID: 3755 Comm: krace_0 Kdump: loaded Tainted: G           O      5.11.0-rc4+ #5
[  157.770683] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1 04/01/2014
[  157.770683] Call Trace:
[  157.770683]  dump_stack+0x77/0x97
[  157.770683]  check_noncircular+0xfe/0x110
[  157.770683]  ? find_held_lock+0x2b/0x80
[  157.770683]  __lock_acquire+0x139e/0x28a0
[  157.770683]  lock_acquire+0xbd/0x360
[  157.770683]  ? klockdep_test_BA+0x2e/0x80 [lockdep_test]
[  157.770683]  ? klockdep_test_AB+0x80/0x80 [lockdep_test]
[  157.770683]  _raw_spin_lock+0x27/0x40
[  157.770683]  ? klockdep_test_BA+0x2e/0x80 [lockdep_test]
[  157.770683]  klockdep_test_BA+0x2e/0x80 [lockdep_test]
[  157.770683]  kthread+0x10a/0x140
[  157.770683]  ? kthread_park+0x80/0x80
[  157.770683]  ret_from_fork+0x22/0x30
```

其中可以很明显看到如下提示
```
[  157.770683]        CPU0                    CPU1
[  157.770683]        ----                    ----
[  157.770683]   lock(&g_lockdep_test.lock_B);
[  157.770683]                                lock(&g_lockdep_test.lock_A);
[  157.770683]                                lock(&g_lockdep_test.lock_B);
[  157.770683]   lock(&g_lockdep_test.lock_A);
```

这个提示简直无敌，完美显示了 `deadlock` 的原因


写了一个`ABBA型` 基于 mutex 的 deadlock demo。参考 [代码](https://github.com/liulangrenaaa/test_modules/blob/main/lock_race/lockdep_test_mutex/lockdep_test_mutex.c)
其实这个demo 会触发多个问题
1. deadlock 被检测出来。
2. 等待 `120s` 之后，由于基于 `mutex`的，所以发生死锁的俩线程都是 `D状态`，所以检测到发生 `hung_task`，然后 panic.

为啥 `mutex` 的waiter会 处于 `D状态` ？看看代码
```
static noinline void __sched
__mutex_lock_slowpath(struct mutex *lock)
{
	__mutex_lock(lock, TASK_UNINTERRUPTIBLE, 0, NULL, _RET_IP_);
}

void __sched mutex_lock(struct mutex *lock)
{
	if (!__mutex_trylock_fast(lock))
		__mutex_lock_slowpath(lock);
}
EXPORT_SYMBOL(mutex_lock);
```
发现等待 mutex的线程都会被设置成 `TASK_UNINTERRUPTIBLE`，也就是 `D状态`。

也可以通过 hung_task 之后panic 的现场看出来
```
crash> ps | grep UN
   3193      2   2  ffff9127bb82b240  UN   0.0       0      0  [krace_0]
   3194      2   0  ffff9127c3458040  UN   0.0       0      0  [krace_1]
crash> bt 3193
PID: 3193   TASK: ffff9127bb82b240  CPU: 2   COMMAND: "krace_0"
 #0 [ffffb557007efd78] __schedule at ffffffff8c319af2
 #1 [ffffb557007efe08] schedule at ffffffff8c31a1e6
 #2 [ffffb557007efe20] schedule_preempt_disabled at ffffffff8c31a53c
 #3 [ffffb557007efe28] __mutex_lock at ffffffff8c31bcd5
 #4 [ffffb557007eff08] klockdep_test_mutex_BA at ffffffffc02990b2 [lockdep_test_mutex]
 #5 [ffffb557007eff10] kthread at ffffffff8b6930da
 #6 [ffffb557007eff50] ret_from_fork at ffffffff8b601ae2
crash>
crash> bt 3194
PID: 3194   TASK: ffff9127c3458040  CPU: 0   COMMAND: "krace_1"
 #0 [ffffb557004c3d78] __schedule at ffffffff8c319af2
 #1 [ffffb557004c3e08] schedule at ffffffff8c31a1e6
 #2 [ffffb557004c3e20] schedule_preempt_disabled at ffffffff8c31a53c
 #3 [ffffb557004c3e28] __mutex_lock at ffffffff8c31bcd5
 #4 [ffffb557004c3f08] klockdep_test_mutex_AB at ffffffffc0299032 [lockdep_test_mutex]
 #5 [ffffb557004c3f10] kthread at ffffffff8b6930da
 #6 [ffffb557004c3f50] ret_from_fork at ffffffff8b601ae2
crash>
```

可以看到 `krace_0` `krace_1` 线程都是处于 `UN` 状态，这也导致此时系统负载有`2`
```
crash> sys
      KERNEL: vmlinux
    DUMPFILE: dump.202101221553  [PARTIAL DUMP]
        CPUS: 4
        DATE: Fri Jan 22 15:53:16 CST 2021
      UPTIME: 00:04:06
LOAD AVERAGE: 1.96, 1.10, 0.46
```

再看一下 检测到的死锁日志：
```
[   60.151205] lockdep_test_mutex: loading out-of-tree module taints kernel.
[   70.216063]
[   70.216623] ======================================================
[   70.216866] WARNING: possible circular locking dependency detected
[   70.216866] 5.11.0-rc4+ #5 Tainted: G           O
[   70.216866] ------------------------------------------------------
[   70.216866] krace_0/3193 is trying to acquire lock:
[   70.216866] ffffffffc029b4b8 (&g_lockdep_test_mutex.lock_A){+.+.}-{3:3}, at: klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]
               but task is already holding lock:
[   70.216866] ffffffffc029b548 (&g_lockdep_test_mutex.lock_B){+.+.}-{3:3}, at: klockdep_test_mutex_BA+0x1a/0x80 [lockdep_test_mutex]
[   70.216866]
               which lock already depends on the new lock.

[   70.216866]
               the existing dependency chain (in reverse order) is:
[   70.216866]
               -> #1 (&g_lockdep_test_mutex.lock_B){+.+.}-{3:3}:
[   70.216866]        __mutex_lock+0x8d/0x920
[   70.216866]        klockdep_test_mutex_AB+0x32/0x80 [lockdep_test_mutex]
[   70.216866]        kthread+0x10a/0x140
[   70.216866]        ret_from_fork+0x22/0x30
[   70.216866]
               -> #0 (&g_lockdep_test_mutex.lock_A){+.+.}-{3:3}:
[   70.216866]        __lock_acquire+0x139e/0x28a0
[   70.216866]        lock_acquire+0xbd/0x360
[   70.216866]        __mutex_lock+0x8d/0x920
[   70.216866]        klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]        kthread+0x10a/0x140
[   70.216866]        ret_from_fork+0x22/0x30
[   70.216866]
               other info that might help us debug this:

[   70.216866]  Possible unsafe locking scenario:

[   70.216866]        CPU0                    CPU1
[   70.216866]        ----                    ----
[   70.216866]   lock(&g_lockdep_test_mutex.lock_B);
[   70.216866]                                lock(&g_lockdep_test_mutex.lock_A);
[   70.216866]                                lock(&g_lockdep_test_mutex.lock_B);
[   70.216866]   lock(&g_lockdep_test_mutex.lock_A);
[   70.216866]
                *** DEADLOCK ***

[   70.216866] 1 lock held by krace_0/3193:
[   70.216866]  #0: ffffffffc029b548 (&g_lockdep_test_mutex.lock_B){+.+.}-{3:3}, at: klockdep_test_mutex_BA+0x1a/0x80 [lockdep_test_mutex]
[   70.216866]
               stack backtrace:
[   70.216866] CPU: 2 PID: 3193 Comm: krace_0 Kdump: loaded Tainted: G           O      5.11.0-rc4+ #5
[   70.216866] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1 04/01/2014
[   70.216866] Call Trace:
[   70.216866]  dump_stack+0x77/0x97
[   70.216866]  check_noncircular+0xfe/0x110
[   70.216866]  __lock_acquire+0x139e/0x28a0
[   70.216866]  lock_acquire+0xbd/0x360
[   70.216866]  ? klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]  ? lockdep_hardirqs_on_prepare+0xd4/0x170
[   70.216866]  ? _raw_spin_unlock_irqrestore+0x34/0x40
[   70.216866]  __mutex_lock+0x8d/0x920
[   70.216866]  ? klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]  ? find_held_lock+0x2b/0x80
[   70.216866]  ? klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]  ? __next_timer_interrupt+0x100/0x100
[   70.216866]  ? klockdep_test_mutex_AB+0x80/0x80 [lockdep_test_mutex]
[   70.216866]  ? klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]  ? klockdep_test_mutex_AB+0x80/0x80 [lockdep_test_mutex]
[   70.216866]  klockdep_test_mutex_BA+0x32/0x80 [lockdep_test_mutex]
[   70.216866]  kthread+0x10a/0x140
[   70.216866]  ? kthread_park+0x80/0x80
[   70.216866]  ret_from_fork+0x22/0x30
```

同样也是 给出了很详细出错位置，对于找出问题代码一如反掌。
```
[   70.216866]        CPU0                    CPU1
[   70.216866]        ----                    ----
[   70.216866]   lock(&g_lockdep_test_mutex.lock_B);
[   70.216866]                                lock(&g_lockdep_test_mutex.lock_A);
[   70.216866]                                lock(&g_lockdep_test_mutex.lock_B);
[   70.216866]   lock(&g_lockdep_test_mutex.lock_A);
```

## lockdep 代码

之后填坑






## 死锁带来的影响
对于线程自身
1. `spinlock` 的死锁可以带来 线程一直在`spin`，占用cpu且无法恢复.
2. `mutex` `semaphore` `rwsem` 的死锁会在`slowpath` 中让线程进入了
`TASK_UNINTERRUPTIBLE` 状态，导致不响应外部信号，也无法使用 `kill` 去杀死

对于系统
1. `spinlock` 的死锁可以带来 `rcu stall` `soft lockup` `hard lockup`问题，如果对应项
设置了 panic 选项，就会导致 kernel panic.
2. `mutex` `semaphore` `rwsem` 的死锁会带来系统的 load升高，因为都在 `slowpath` 中让线
程进入了`TASK_UNINTERRUPTIBLE` 状态，会被统计为系统负载，最后会导致 hung_task 发生，如果对应项设置了 panic 选项，就会导致 kernel panic.

不同锁进入slowpath的行为
```
mutex:
static noinline void __sched
__mutex_lock_slowpath(struct mutex *lock)
{
	__mutex_lock(lock, TASK_UNINTERRUPTIBLE, 0, NULL, _RET_IP_);
}

semaphore:
static noinline void __sched __down(struct semaphore *sem)
{
	__down_common(sem, TASK_UNINTERRUPTIBLE, MAX_SCHEDULE_TIMEOUT);
}

semaphore:
static noinline void __sched __down(struct semaphore *sem)
{
	__down_common(sem, TASK_UNINTERRUPTIBLE, MAX_SCHEDULE_TIMEOUT);
}

rwsem:
static inline void __down_write(struct rw_semaphore *sem)
{
	__down_write_common(sem, TASK_UNINTERRUPTIBLE);
}
```

可以参考：
[stack overflow提问](https://stackoverflow.com/questions/20892822/how-to-use-lockdep-feature-in-linux-kernel-for-deadlock-detection)
[博客园文章](https://www.cnblogs.com/arnoldlu/p/8580387.html)
[魅族内核团队文章](http://kernel.meizu.com/linux-dead-lock-detect-lockdep.html)
[内核文档](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/locking/)
