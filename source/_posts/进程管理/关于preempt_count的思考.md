---
title: 关于preempt_count的思考
date: 2020-09-21 19:00:00
sticky: 70
tags:
    - 进程调度
    - 内核同步
    - preempt_count
    - 内核抢占
categories:
    - linux内核
---

preempt_conut 本质就是一个int型的数，是每个 `task_struct` 的 `thread_info` 的一个成员变量，但是他和系统的调度密切相关，当然也十分重要。

```
struct thread_info {
	unsigned long		flags;		/* low level flags */
	int			preempt_count;	/* 0 => preemptable, <0 => bug */
    .......
};
```

在 `inlcude/linux/preempt.h` 文件看相关定义
```
static __always_inline int preempt_count(void)
{
	return READ_ONCE(current_thread_info()->preempt_count);
}

/*
 *         PREEMPT_MASK:	0x000000ff
 *         SOFTIRQ_MASK:	0x0000ff00
 *         HARDIRQ_MASK:	0x000f0000
 *             NMI_MASK:	0x00100000
 * PREEMPT_NEED_RESCHED:	0x80000000
 */
#define PREEMPT_BITS	8
#define SOFTIRQ_BITS	8
#define HARDIRQ_BITS	4
#define NMI_BITS	1

#define PREEMPT_SHIFT	0
#define SOFTIRQ_SHIFT	(PREEMPT_SHIFT + PREEMPT_BITS)
#define HARDIRQ_SHIFT	(SOFTIRQ_SHIFT + SOFTIRQ_BITS)
#define NMI_SHIFT	(HARDIRQ_SHIFT + HARDIRQ_BITS)

#define hardirq_count()	(preempt_count() & HARDIRQ_MASK)
#define softirq_count()	(preempt_count() & SOFTIRQ_MASK)
#define irq_count()	(preempt_count() & (HARDIRQ_MASK | SOFTIRQ_MASK \
				 | NMI_MASK))

#define in_irq()		(hardirq_count())
#define in_softirq()		(softirq_count())
#define in_interrupt()		(irq _count())
#define in_serving_softirq()	(softirq_count() & SOFTIRQ_OFFSET)
#define in_nmi()		(preempt_count() & NMI_MASK)
#define in_task()		(!(preempt_count() & \
				   (NMI_MASK | HARDIRQ_MASK | SOFTIRQ_OFFSET)))
```

可以看出 `preempt_count` 0-7 bit被用来抢占计数，8-15 bit被用来软中断计数，16-19 bit被用来硬件中断计数，20bit 被用来 NMI中断计数，31 bit被用来记录是否需要立即sched.

in_interrupt() 这些宏本质也是根据 preempt_count()来判断的。

## hard irq
在进入irq的时候通过 `irq_enter` 将preempt_count 的 16-19bit ++，在退出irq的时候通过 `irq_exit` 将preempt_count 的 16-19bit --，但是由于目前linux中的中断往往是不可嵌套的，所以一般 hardirq 只会用到 16 bit，为什么linux给 hardirq 保留了4bit呢，這是歷史原因造成的，早期hardirq还是可以嵌套的。

irq_enter()
```
#define preempt_count_add(val)	__preempt_count_add(val)

#define __irq_enter()					\
	do {						\
		account_irq_enter_time(current);	\
		preempt_count_add(HARDIRQ_OFFSET);	\  // preempt_count 和 hardirq相关++
		trace_hardirq_enter();			\
	} while (0)

void irq_enter(void) //进入中断上下文
{
	rcu_irq_enter();
	if (is_idle_task(current) && !in_interrupt()) {
		/*
		 * Prevent raise_softirq from needlessly waking up ksoftirqd
		 * here, as softirq will be serviced on return from interrupt.
		 */
		local_bh_disable();
		tick_irq_enter();
		_local_bh_enable();
	}

	__irq_enter();
}
```

irq_exit()
```
#define preempt_count_sub(val)	__preempt_count_sub(val)

void irq_exit(void) //退出中断上下文
{
#ifndef __ARCH_IRQ_EXIT_IRQS_DISABLED
	local_irq_disable();
#else
	lockdep_assert_irqs_disabled();
#endif
	account_irq_exit_time(current);
	preempt_count_sub(HARDIRQ_OFFSET); // preempt_count 和 hardirq相关--
	if (!in_interrupt() && local_softirq_pending())
		invoke_softirq();

	tick_irq_exit();
	rcu_irq_exit();
	trace_hardirq_exit(); /* must be last! */
}
```


## soft irq
preempt_count中的第8到15个bit表示softirq count，它记录了进入softirq的嵌套次数，如果softirq count的值为正数，说明现在正处于softirq上下文中。
由于softirq在单个CPU上是不会嵌套执行的，因此和hardirq count一样，实际只需要一个bit(bit 8)就可以了。
还有一种情况，softirq count 会用到不止 bit8，在禁用中断下半部的情况下，每禁用一次softirq count 就会增加1，理论上最多可以嵌套16次。

进入退出软中断的case
```
asmlinkage __visible void __softirq_entry __do_softirq(void)
{
    ......
	__local_bh_disable_ip(_RET_IP_, SOFTIRQ_OFFSET);
    ......
	while ((softirq_bit = ffs(pending))) {
        ......
		h->action(h);
        ......
	}
    ......
	__local_bh_enable(SOFTIRQ_OFFSET);
    ......
}
```

禁止、开启中断下半部的case
```
void __local_bh_enable_ip(unsigned long ip, unsigned int cnt)
{
    ...xxx
}

static inline void local_bh_enable_ip(unsigned long ip)
{
	__local_bh_enable_ip(ip, SOFTIRQ_DISABLE_OFFSET);// 开启中断下半部的preempt_count 和 softirq相关++
}
//开启下半部
---------------
//禁止下半部
static __always_inline void __local_bh_disable_ip(unsigned long ip, unsigned int cnt)
{
	preempt_count_add(cnt);
	barrier();
}

static inline void __raw_spin_lock_bh(raw_spinlock_t *lock)
{
	__local_bh_disable_ip(_RET_IP_, SOFTIRQ_LOCK_OFFSET); // 禁止中断下半部的preempt_count 和 softirq相关++
	spin_acquire(&lock->dep_map, 0, 0, _RET_IP_);
	LOCK_CONTENDED(lock, do_raw_spin_trylock, do_raw_spin_lock);
}

void __lockfunc _raw_spin_lock_bh(raw_spinlock_t *lock)
{
	__raw_spin_lock_bh(lock);
}

#define raw_spin_lock_bh(lock)		_raw_spin_lock_bh(lock)

static __always_inline void spin_lock_bh(spinlock_t *lock)
{
	raw_spin_lock_bh(&lock->rlock);
}
```
可以看出来执行软中断 和 禁止中断下半部都属于软中断上下文。
（我有个疑问，禁止hard irq 属于硬件中断上下文吗？从 in_irq的定义上看不是，但是和软中断不太一样）

## process context
进程上下文，当然不仅仅是进程，只要不是出于NMI、HARD IRQ、SOFT IRQ上下文的都算进程上下文，包括内核线程（包括ksoftirqd、kworker内核线程等）
```
#define in_task()		(!(preempt_count() & \
				   (NMI_MASK | HARDIRQ_MASK | SOFTIRQ_OFFSET)))
```

中断上下文不会发生进程切换，是一种隐式的进制调度方法。通常也可以使用 `preempt_disable` 来显式关闭调度，对 preempt_count ++。

## atomic context
处于中断上下文中(NMI、hard、soft) 或者 禁止抢占的情况下，都属于原子上下文
```
static __always_inline int preempt_count(void)
{
	return READ_ONCE(current_thread_info()->preempt_count);
}

#define in_atomic()	(preempt_count() != 0)
```

参考：
[Linux中的preempt_count](https://zhuanlan.zhihu.com/p/88883239)
