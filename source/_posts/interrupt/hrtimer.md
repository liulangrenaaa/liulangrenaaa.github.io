---
title: hrtimer
date: 2021-03-04 19:00:40
tags:
    - intrrrupt
    - hrtimer
categories:
    - linux内核
---

hrtimer没有使用时间轮对定时器进行管理，而是选用了更加通用、性能稳定的红黑树。红黑树查找，插入和删除平均时间复杂度是O(logN)。虽然查找的时间复杂度达不到O(1)，但是避免了时间轮的迁移。

因此在平均性能上红黑树和时间轮会较为接近。 hrtimer红黑树是在红黑树的基础上做了简单的封装，hrtimer红黑树节点使用数据结构struct timerqueue_node，比rb_node多了一个expires字段，用于记录超时时刻。
hrtimer的数据结构与动态定时器的数据结构类似。

```
struct timerqueue_node {
	struct rb_node node;
	ktime_t expires;
};

// include/linux/hrtimer.h
/**
 * struct hrtimer - the basic hrtimer structure
 * @node:	timerqueue node, which also manages node.expires,
 *		the absolute expiry time in the hrtimers internal
 *		representation. The time is related to the clock on
 *		which the timer is based. Is setup by adding
 *		slack to the _softexpires value. For non range timers
 *		identical to _softexpires.
 * @_softexpires: the absolute earliest expiry time of the hrtimer.
 *		The time which was given as expiry time when the timer
 *		was armed.
 * @function:	timer expiry callback function
 * @base:	pointer to the timer base (per cpu and per clock)
 * @state:	state information (See bit values above)
 * @is_rel:	Set if the timer was armed relative
 * @is_soft:	Set if hrtimer will be expired in soft interrupt context.
 * @is_hard:	Set if hrtimer will be expired in hard interrupt context
 *		even on RT.
 *
 * The hrtimer structure must be initialized by hrtimer_init()
 */
struct hrtimer {
	struct timerqueue_node		node;
	ktime_t				_softexpires;
	enum hrtimer_restart		(*function)(struct hrtimer *);
	struct hrtimer_clock_base	*base;
	u8				state;
	u8				is_rel;
	u8				is_soft;
	u8				is_hard;
};

/**
 * struct hrtimer_sleeper - simple sleeper structure
 * @timer:	embedded timer structure
 * @task:	task to wake up
 *
 * task is set to NULL, when the timer expires.
 */
struct hrtimer_sleeper {
	struct hrtimer timer;
	struct task_struct *task;
};
```

hrtimer和动态定时器一样拥有超时计数字段_softexpires和超时后的回调函数。 通过比较当前时间是否大于_softexpires来决定定时器超时，执行回调函数。 在红黑树的node中同样保存了一份expires，node.expires大于等于_softexpires。 这样做的目的是在高精度模式下，在_softexpires到node.expires期间设定定时器被触发的时间。

hrtimer管理器结构
```
struct hrtimer_cpu_base {
	raw_spinlock_t			lock;
	unsigned int			cpu;
	unsigned int			active_bases;
	unsigned int			clock_was_set_seq;
	unsigned int			hres_active		: 1,
					in_hrtirq		: 1,
					hang_detected		: 1,
					softirq_activated       : 1;
#ifdef CONFIG_HIGH_RES_TIMERS
	unsigned int			nr_events;
	unsigned short			nr_retries;
	unsigned short			nr_hangs;
	unsigned int			max_hang_time;
#endif
	ktime_t				expires_next;
	struct hrtimer			*next_timer;
	ktime_t				softirq_expires_next;
	struct hrtimer			*softirq_next_timer;
	struct hrtimer_clock_base	clock_base[HRTIMER_MAX_CLOCK_BASES];
} ____cacheline_aligned;
```

`running` 字段指向正在执行的 `hrtimer`。 next_timer字段指向第一个超时的hrtimer。 clock_base字段是当前CPU维护的定时器树。 目前每个CPU都维护了若干组定时器树，其中包括单条递增时间HRTIMER_BASE_MONOTONIC,上墙时间HRTIMER_BASE_REALTIME等。
。


hrtimer有两种精度模式，高精度模式和低精度模式。那么同样的数据设计，如何实现两种精度呢？ 这里的关键就是调用检查hrtimer函数的地方。我们来看看两种精度的调用栈。

低精度
```
timer_interrupt() -> update_process_times() -> run_local_timers() -> hrtimer_run_queues() -> __hrtimer_run_queues()
```

高精度
```
hrtimer_interrupt() -> __hrtimer_run_queues()
```

当hrtimer处于低精度模式时，每次irq0上的时间中断，即每次tick事件，调用一次检查hrtimer函数。 tick的频率是1000hz，此时，hrtimer处于低精度模式。 在第一篇文章中，我们提到TSC、HPET都是可以提供纳秒级的时间设备。 当hrtimer处于高精度模式时，Linux把hrtimer_interrupt()绑定到高精度的时间设备，这时就可以提供纳秒级的定时器服务了。 但是频繁的调用检查hrtimer函数会非常消耗机器性能。 为了避免这个缺陷，hrtimer_interrupt()的调用采用了one-shot的模式。每一次调用都会设定下一次调用的时间。




参考[高精度定时器Hrtimer](http://rangechow.com/2016/04/19/%E9%AB%98%E7%B2%BE%E5%BA%A6%E5%AE%9A%E6%97%B6%E5%99%A8Hrtimer.html)


