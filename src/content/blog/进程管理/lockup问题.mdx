---
title: linux lockup问题
date: 2020-09-12 19:00:00
tags:
    - 进程调度
    - hardlockup
    - softlockup
categories:
    - linux内核
slug: "进程管理/lockup问题"
---


## lockup定义
lockup是指是指某段内核代码占着CPU不放。

lockup分两种：hard lockup 与 soft lockup，区别是hard lockup是屏蔽系统中断情况下发生的。
贴一段原文：
```
Short answer：
A ‘soft lockup’ is defined as a bug that causes the kernel to loop in kernel mode for more than 20 seconds […], without giving other tasks a chance to run.

A ‘hard lockup’ is defined as a bug that causes the CPU to loop in kernel mode for more than 10 seconds […], without letting other interrupts have a chance to run.
```

有几个概念需要澄清一下：
1. 发生lockup的一定是内核代码，因为用户态代码都是可以抢占的。
2. 在内核态代码中发生lockup时，一般伴随着 preempt_disable()或者local_irq_disable()，产生lockup 的基本条件是禁止抢占，当然禁止中断这种就更猛了

## Soft lockup
Soft lockup是指CPU被内核代码一直占用着，系统某个CPU上超过20s其他进程无法得到运行。
系统是如何检测 Soft lockup的呢？

### 实现机制
设立涉及到几个概念：一般优先级的普通进程，最高优先级的watchdog/?内核线程，Hr-timer时钟中断，其中Hr-timer可以打断watchdog/?执行，watchdog/?可以打断普通优先级的进程执行。

Soft lockup机制在初始化的时候会init一个 Hr-timer，定时执行
在执行过程中
1. 获取 percpu变量 watchdog_touch_ts 的值
2. 唤醒 watchdog/? 内核线程
3. 比较 当前timestamp 和 watchdog_touch_ts值
4. 内核线程会用当前的time_stamp 更新 watchdog_touch_ts

per-cpu 变量`watchdog_touch_ts` 在 `softlockup_fn` --> `update_touch_ts` 中更新
```
static DEFINE_PER_CPU(unsigned long, watchdog_touch_ts);

/* Commands for resetting the watchdog */
static void update_touch_ts(void)
{
	__this_cpu_write(watchdog_touch_ts, get_timestamp());
	update_report_ts();
}

static int softlockup_fn(void *data)
{
	update_touch_ts();
	complete(this_cpu_ptr(&softlockup_completion));

	return 0;
}
```

`softlockup_fn` 主要是在 `watchdog_timer_fn`中使用 `stop_one_cpu_nowait` 来调用的，`watchdog_timer_fn` 是 设置的 per-cpu 的 hrtimer的回调函数。

```
/* watchdog kicker functions */
static enum hrtimer_restart watchdog_timer_fn(struct hrtimer *hrtimer)
{
	unsigned long touch_ts, period_ts, now;
	struct pt_regs *regs = get_irq_regs();
	int duration;
	int softlockup_all_cpu_backtrace = sysctl_softlockup_all_cpu_backtrace;

	if (!watchdog_enabled)
		return HRTIMER_NORESTART;

	/* kick the hardlockup detector */
	watchdog_interrupt_count();

	/* kick the softlockup detector */
	if (completion_done(this_cpu_ptr(&softlockup_completion))) { // 不是直接的函数调用，只是 queue_work 而已。
		reinit_completion(this_cpu_ptr(&softlockup_completion));
		stop_one_cpu_nowait(smp_processor_id(),
				softlockup_fn, NULL,
				this_cpu_ptr(&softlockup_stop_work));
	}

    ......

	/* Check for a softlockup. */
	touch_ts = __this_cpu_read(watchdog_touch_ts);
	duration = is_softlockup(touch_ts, period_ts, now);
	if (unlikely(duration)) {
		/*
		 * Prevent multiple soft-lockup reports if one cpu is already
		 * engaged in dumping all cpu back traces.
		 */
		if (softlockup_all_cpu_backtrace) {
			if (test_and_set_bit_lock(0, &soft_lockup_nmi_warn))
				return HRTIMER_RESTART;
		}

		/* Start period for the next softlockup warning. */
		update_report_ts();

		pr_emerg("BUG: soft lockup - CPU#%d stuck for %us! [%s:%d]\n",
			smp_processor_id(), duration,
			current->comm, task_pid_nr(current));
		print_modules();
		print_irqtrace_events(current);
		if (regs)
			show_regs(regs);
		else
			dump_stack();

		if (softlockup_all_cpu_backtrace) {
			trigger_allbutself_cpu_backtrace();
			clear_bit_unlock(0, &soft_lockup_nmi_warn);
		}

		add_taint(TAINT_SOFTLOCKUP, LOCKDEP_STILL_OK);
		if (softlockup_panic)
			panic("softlockup: hung tasks");
	}
}

static void watchdog_enable(unsigned int cpu)
{
	struct hrtimer *hrtimer = this_cpu_ptr(&watchdog_hrtimer);
	struct completion *done = this_cpu_ptr(&softlockup_completion);

	WARN_ON_ONCE(cpu != smp_processor_id());

	init_completion(done);
	complete(done);

	/*
	 * Start the timer first to prevent the NMI watchdog triggering
	 * before the timer has a chance to fire.
	 */
	hrtimer_init(hrtimer, CLOCK_MONOTONIC, HRTIMER_MODE_REL_HARD);
	hrtimer->function = watchdog_timer_fn;
	hrtimer_start(hrtimer, ns_to_ktime(sample_period),
		      HRTIMER_MODE_REL_PINNED_HARD);

	/* Initialize timestamp */
	update_touch_ts();
	/* Enable the perf event */
	if (watchdog_enabled & NMI_WATCHDOG_ENABLED)
		watchdog_nmi_enable(cpu);
}
```

`stop_one_cpu_nowait` 并不是 直接调用 `softlockup_fn`，只是 queue_work 而已，
```
/* queue @work to @stopper.  if offline, @work is completed immediately */
static bool cpu_stop_queue_work(unsigned int cpu, struct cpu_stop_work *work)
{
	struct cpu_stopper *stopper = &per_cpu(cpu_stopper, cpu);
	DEFINE_WAKE_Q(wakeq);
	unsigned long flags;
	bool enabled;

	preempt_disable();
	raw_spin_lock_irqsave(&stopper->lock, flags);
	enabled = stopper->enabled;
	if (enabled)
		__cpu_stop_queue_work(stopper, work, &wakeq);
	else if (work->done)
		cpu_stop_signal_done(work->done);
	raw_spin_unlock_irqrestore(&stopper->lock, flags);

	wake_up_q(&wakeq);
	preempt_enable();

	return enabled;
}

bool stop_one_cpu_nowait(unsigned int cpu, cpu_stop_fn_t fn, void *arg,
			struct cpu_stop_work *work_buf)
{
	*work_buf = (struct cpu_stop_work){ .fn = fn, .arg = arg, .caller = _RET_IP_, };
	return cpu_stop_queue_work(cpu, work_buf);
}
```

此时如果系统中有 代码路径关闭了抢占，且执行了较长时间，就会实际导致 `softlockup_fn` 这个应该和 hr-timer 发生频率一致的函数得不到执行，从而 `watchdog_touch_ts` 一直没有更新，最后在 `watchdog_timer_fn` 中 会根据`touch_ts = __this_cpu_read(watchdog_touch_ts);` 与 `now` 的值 比较，得出是否发生了 soft lockup问题
```
	/* Check for a softlockup. */
	touch_ts = __this_cpu_read(watchdog_touch_ts);
	duration = is_softlockup(touch_ts, period_ts, now);
```



贴一个其他博客：[进程R状态死锁检测](https://e-mailky.github.io/2017-01-18-kernel-daedlock-check2)

## Hard lockup
Hard lockup是指CPU被内核代码一直占用着，系统某个CPU上超过10s无 hr-timer中断发生，就判断为发生了 hard lockup.

### 实现机制

Hard lockup 是基于 hw-PMU 实现的。

```
/**
 * hardlockup_detector_perf_init - Probe whether NMI event is available at all
 */
int __init hardlockup_detector_perf_init(void)
{
	int ret = hardlockup_detector_event_create();

	if (ret) {
		pr_info("Perf NMI watchdog permanently disabled\n");
	} else {
		perf_event_release_kernel(this_cpu_read(watchdog_ev));
		this_cpu_write(watchdog_ev, NULL);
	}
	return ret;
}

/* Return 0, if a NMI watchdog is available. Error code otherwise */
int __weak __init watchdog_nmi_probe(void)
{
	return hardlockup_detector_perf_init();
}

void __init lockup_detector_init(void)
{
	if (tick_nohz_full_enabled())
		pr_info("Disabling watchdog on nohz_full cores by default\n");

	cpumask_copy(&watchdog_cpumask,
		     housekeeping_cpumask(HK_FLAG_TIMER));

	if (!watchdog_nmi_probe())
		nmi_watchdog_available = true;
	lockup_detector_setup();
}
```

主要的初始化工作是 `hardlockup_detector_event_create` 做的，将 `watchdog_overflow_callback` 设置为 pmu nmi interrupt 中断 handler.

```
static int hardlockup_detector_event_create(void)
{
	unsigned int cpu = smp_processor_id();
	struct perf_event_attr *wd_attr;
	struct perf_event *evt;

	wd_attr = &wd_hw_attr;
	wd_attr->sample_period = hw_nmi_get_sample_period(watchdog_thresh);

	/* Try to register using hardware perf events */
	evt = perf_event_create_kernel_counter(wd_attr, cpu, NULL,
					       watchdog_overflow_callback, NULL);
	if (IS_ERR(evt)) {
		pr_debug("Perf event create on CPU %d failed with %ld\n", cpu,
			 PTR_ERR(evt));
		return PTR_ERR(evt);
	}
	this_cpu_write(watchdog_ev, evt);
	return 0;
}
```

在 `watchdog_overflow_callback` 中，`is_hardlockup` 来判断是否发生了 hardlockup.
`hrtimer_interrupts` 是 per-cpu 的变量，在 per-cpu 的 hr-timer 中断handler中增加 `hrtimer_interrupts` 数值，在 `is_hardlockup` 中判断是否发生了 hardlockup.

主要利用了 hr-timer 是可屏蔽的中断，但是 HW-pmu 是不可屏蔽的中断。如果本地 cpu 中断禁止了，那么 hr-timer 的 handler就无法执行，但是 HW-pmu 的中断是可以执行的。
```
static void watchdog_interrupt_count(void)
{
	__this_cpu_inc(hrtimer_interrupts);
}

/* watchdog detector functions */
bool is_hardlockup(void)
{
	unsigned long hrint = __this_cpu_read(hrtimer_interrupts); // hr-timer 中增加的

	if (__this_cpu_read(hrtimer_interrupts_saved) == hrint)
		return true;

	__this_cpu_write(hrtimer_interrupts_saved, hrint);
	return false;
}

/* Callback function for perf event subsystem */
static void watchdog_overflow_callback(struct perf_event *event,
				       struct perf_sample_data *data,
				       struct pt_regs *regs)
{
	/* Ensure the watchdog never gets throttled */
	event->hw.interrupts = 0;

	if (__this_cpu_read(watchdog_nmi_touch) == true) {
		__this_cpu_write(watchdog_nmi_touch, false);
		return;
	}

	if (!watchdog_check_timestamp())
		return;

	if (is_hardlockup()) {
		int this_cpu = smp_processor_id();
		...
	}
	...
}
```



参考[内核如何检测SOFT LOCKUP与HARD LOCKUP？](http://linuxperf.com/?p=83)
参考[softlockup/hardlockup原理详细介绍](https://blog.csdn.net/hzj_001/article/details/100054659)


## lockup 与 hung_task 区别
### soft lockup：

一定是 `RU` 状态进程触发的， `RU` 状态进程一直运行，占用CPU超过20s之后，还未有过进程切换，就会出现这个问题。

最好复现方式是: preempt_disable()之后 一直循环等待，不去preempt_enable()，这时候就会触发
这个问题。
a. spin_lock() / preempt_disable()
```
spin_lock(&lock);
while(1) {
    i = i + 1;
}
spin_unlock(&lock);
```

b. spinlock的 dead_lock 也会触发这种问题
```
    CPU0                            CPU1
                        spin_lock(&lock_B);
spin_lock(&lock_A);
                        spin_lock(&lock_A);
spin_lock(&lock_B);
xxx
```
此时 `CPU0` `CPU1` 都会检测到 `soft lockup`


### hard lockup：
也一定是 `RU` 状态进程触发的， `RU` 状态进程一直运行，同时禁止了本地中断。占用CPU超过10s之后，还未有过进程切换且本地中断还未打开，就会出现这个问题。

与 soft lockup 相比，只是加了一个条件是中断关闭。
最好复现方式是: `local_irq_disable()` 之后 一直循环等待，不去 `local_irq_enable()`，
这时候就会触发 `hard lockup` 这个问题。

```

```


### hung task：
hung task 一定是 `UN` 状态进程触发的，hung_task
从 注释可以看到
```
/*
 * Check whether a TASK_UNINTERRUPTIBLE does not get woken up for
 * a really long time (120 seconds). If that happens, print out
 * a warning.
 */
```

`UN` 是 `TASK_UNINTERRUPTIBLE` 缩写，也就是`D状态`的线程。


