---
title: stop_task
date: 2021-05-19 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
---



## stop_task
`stop_task` 实现在 `kernel/sched/stop_task.c` 中，在所有调度类中
`stop_sched_class`的优先级是最高的。

```
#define SCHED_DATA				\
	STRUCT_ALIGN();				\
	__begin_sched_classes = .;		\
	*(__idle_sched_class)			\
	*(__fair_sched_class)			\
	*(__rt_sched_class)			\
	*(__dl_sched_class)			\
	*(__stop_sched_class)			\
	__end_sched_classes = .;
```


其实在 linux中一个 per cpu的 rq中，每个rq只会有一个 stop task
```
struct rq {
	/* runqueue lock: */
	raw_spinlock_t		lock;

	struct task_struct __rcu	*curr;
	struct task_struct	*idle;
	struct task_struct	*stop;
        ......
}
```

且 `stop task` never migrates，不会迁移，只会固定在某个 cpu上跑，所以 select_task_rq_stop 实现:
```
static int
select_task_rq_stop(struct task_struct *p, int cpu, int flags)
{
	return task_cpu(p); /* stop tasks as never migrate */
}
```

且 `stop task` can not be preempted，不会被抢占，check_preempt_curr_stop 实现：
```
static void
check_preempt_curr_stop(struct rq *rq, struct task_struct *p, int flags)
{
	/* we're never preempted */
}
```

因为 `stop_task`， rq上只有一个stop_sched_class的 task，所以 pick_next_task_stop 实现很简单：
```
static struct task_struct *pick_next_task_stop(struct rq *rq)
{
	if (!sched_stop_runnable(rq))
		return NULL;

	set_next_task_stop(rq, rq->stop, true);
	return rq->stop;
}
```




## 外部模块使用

在 soft lockup 检测模块中，就利用了stop_class 这个调度类。
`watchdog.c` 中使用
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
	if (completion_done(this_cpu_ptr(&softlockup_completion))) {
		reinit_completion(this_cpu_ptr(&softlockup_completion));
		stop_one_cpu_nowait(smp_processor_id(),
				softlockup_fn, NULL,
				this_cpu_ptr(&softlockup_stop_work));
	}
	......
}
```

其中 `stop_one_cpu_nowait` 并不直接调用 `softlockup_fn`函数，只是将他 queue work 而已

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

可以看到 stopper 是 `&per_cpu(cpu_stopper, cpu)`, 定义是
```
struct cpu_stopper {
	struct task_struct	*thread;

	raw_spinlock_t		lock;
	bool			enabled;	/* is this stopper enabled? */
	struct list_head	works;		/* list of pending works */

	struct cpu_stop_work	stop_work;	/* for stop_cpus */
	unsigned long		caller;
	cpu_stop_fn_t		fn;
};

static DEFINE_PER_CPU(struct cpu_stopper, cpu_stopper);
```

在 每个 CPU 上的 stop_class 进程是 `migration/x`
```
static struct smp_hotplug_thread cpu_stop_threads = {
	.store			= &cpu_stopper.thread,
	.thread_should_run	= cpu_stop_should_run,
	.thread_fn		= cpu_stopper_thread,
	.thread_comm		= "migration/%u",
	.create			= cpu_stop_create,
	.park			= cpu_stop_park,
	.selfparking		= true,
};
```

shell 可以看到
```
ubuntu@zeku_server:~/workspace/linux $ ps -aux | grep migration
root          14  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/0]
root          19  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/1]
root          25  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/2]
root          31  0.0  0.0      0     0 ?        S    9月03   0:04 [migration/3]
root          37  0.0  0.0      0     0 ?        S    9月03   0:04 [migration/4]
root          43  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/5]
root          49  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/6]
root          55  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/7]
root          61  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/8]
root          67  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/9]
root          73  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/10]
root          79  0.0  0.0      0     0 ?        S    9月03   0:05 [migration/11]
ubuntu     35458  0.0  0.0  12224   836 pts/0    S+   15:26   0:00 grep --color=auto migration
ubuntu@zeku_server:~/workspace/linux $
```