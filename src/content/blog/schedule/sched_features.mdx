---
title: sched_features
date: 2021-05-25 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
slug: "schedule/sched_features"
---



## WHAT?
`sched features` 是 linux scheduler 的一些 feature实现开关，可以在系统运行中动态开关，相关 feature 在 `kernel/sched/features.h` 有定义。

## feature 拆解
每个 feature 对调度行为都有一定影响或者优化，但是需要根据实际情况来选择是否开启 这个 feature.

### GENTLE_FAIR_SLEEPERS
```
/*
 * Only give sleepers 50% of their service deficit. This allows
 * them to run sooner, but does not allow tons of sleepers to
 * rip the spread apart.
 */
SCHED_FEAT(GENTLE_FAIR_SLEEPERS, true)
```
`GENTLE_FAIR_SLEEPERS` 主要是 减少对 sleep task的 vruntime 补偿。


```
/*
		 * Halve their sleep time's effect, to allow
		 * for a gentler effect of sleepers:
		 */
		if (sched_feat(GENTLE_FAIR_SLEEPERS))
			thresh >>= 1;

		vruntime -= thresh;
```
实际 使用时，仅仅是将 补偿时间减少一半。


### START_DEBIT
```
/*
 * Place new tasks ahead so that they do not starve already running
 * tasks
 */
SCHED_FEAT(START_DEBIT, true)
```
`START_DEBIT` 主要是 对 initial task 的一种惩罚，对 vruntime 增加，可以让运行时间减少 和 不会立刻运行。


```
static void
place_entity(struct cfs_rq *cfs_rq, struct sched_entity *se, int initial)
{
	u64 vruntime = cfs_rq->min_vruntime;

	/*
	 * The 'current' period is already promised to the current tasks,
	 * however the extra weight of the new task will slow them down a
	 * little, place the new task so that it fits in the slot that
	 * stays open at the end.
	 */
	if (initial && sched_feat(START_DEBIT))
		vruntime += sched_vslice(cfs_rq, se);
```

### NEXT_BUDDY
```
/*
 * Prefer to schedule the task we woke last (assuming it failed
 * wakeup-preemption), since its likely going to consume data we
 * touched, increases cache locality.
 */
SCHED_FEAT(NEXT_BUDDY, false)
```
`NEXT_BUDDY` 主要是 希望可以 尽快调度到 抢占 `curr`的 task.

```
static void check_preempt_wakeup(struct rq *rq, struct task_struct *p, int wake_flags)
{
	......
	if (sched_feat(NEXT_BUDDY) && scale && !(wake_flags & WF_FORK)) {
		set_next_buddy(pse);
		next_buddy_marked = 1;
	}
```

### LAST_BUDDY
```
/*
 * Prefer to schedule the task that ran last (when we did
 * wake-preempt) as that likely will touch the same data, increases
 * cache locality.
 */
SCHED_FEAT(LAST_BUDDY, true)
```
`LAST_BUDDY` 主要是 希望可以尽快调度到上次被 `wakeup task` `preempt` 的task。

```
static void check_preempt_wakeup(struct rq *rq, struct task_struct *p, int wake_flags)
{
	......
	if (sched_feat(LAST_BUDDY) && scale && entity_is_task(se))
		set_last_buddy(se);
}
```

### CACHE_HOT_BUDDY
```
/*
 * Consider buddies to be cache hot, decreases the likeliness of a
 * cache buddy being migrated away, increases cache locality.
 */
SCHED_FEAT(CACHE_HOT_BUDDY, true)
```
认为 [last|next]buddies 是 cache hot的，所以不能让他们 migrate away，增加 cache 命中率。

```
/*
 * Is this task likely cache-hot:
 */
static int task_hot(struct task_struct *p, struct lb_env *env)
{
	......
	/*
	 * Buddy candidates are cache hot:
	 */
	if (sched_feat(CACHE_HOT_BUDDY) && env->dst_rq->nr_running &&
			(&p->se == cfs_rq_of(&p->se)->next ||
			 &p->se == cfs_rq_of(&p->se)->last))
		return 1;
}
```

### WAKEUP_PREEMPTION
```
/*
 * Allow wakeup-time preemption of the current task:
 */
SCHED_FEAT(WAKEUP_PREEMPTION, true)
```
是否可以唤醒强占， 后续补充


### HRTICK HRTICK_DL DOUBLE_TICK
```
SCHED_FEAT(HRTICK, false)
SCHED_FEAT(HRTICK_DL, false)
SCHED_FEAT(DOUBLE_TICK, false)
```
`HRTICK HRTICK_DL DOUBLE_TICK` 这三个 feature 主要是利用 `rq->hrtick_timer` 优化调度行为的。

```
static void __sched notrace __schedule(bool preempt)
{
	......
	if (sched_feat(HRTICK) || sched_feat(HRTICK_DL))
		hrtick_clear(rq);
```

主要是 `dl task` 会使用 这个 hrtimer 在`dl->runtime`到期的时候 发生一个 tick，使得任务运行时间更加精准
```
static void start_hrtick_dl(struct rq *rq, struct task_struct *p)
{
	hrtick_start(rq, p->dl.runtime);
}

static void set_next_task_dl(struct rq *rq, struct task_struct *p, bool first)
{
	p->se.exec_start = rq_clock_task(rq);

	if (hrtick_enabled_dl(rq))
		start_hrtick_dl(rq, p);
}
```

 `cfs task` 会使用 这个 hrtimer 在`delta` 期望运行时间 到期的时候 发生一个 tick_fair，使得运行时间更加精准。
```
static void hrtick_start_fair(struct rq *rq, struct task_struct *p)
{
	struct sched_entity *se = &p->se;
	struct cfs_rq *cfs_rq = cfs_rq_of(se);

	SCHED_WARN_ON(task_rq(p) != rq);

	if (rq->cfs.h_nr_running > 1) {
		u64 slice = sched_slice(cfs_rq, se);
		u64 ran = se->sum_exec_runtime - se->prev_sum_exec_runtime;
		s64 delta = slice - ran;

		if (delta < 0) {
			if (task_current(rq, p))
				resched_curr(rq);
			return;
		}
		hrtick_start(rq, delta);
	}
}

struct task_struct *
pick_next_task_fair(struct rq *rq, struct task_struct *prev, struct rq_flags *rf)
{
	......
	if (hrtick_enabled_fair(rq))
		hrtick_start_fair(rq, p);
}
```


### NONTASK_CAPACITY

### TTWU_QUEUE
```
/*
 * Queue remote wakeups on the target CPU and process them
 * using the scheduler IPI. Reduces rq->lock contention/bounces.
 */
SCHED_FEAT(TTWU_QUEUE, true)
```
`TTWU_QUEUE` 主要是 使用 `IPI` 去唤醒 `remote queue` 上的task，而不是操作`rq->lock`，然后操作队列上的 entity，这会减少 `rq->lock`的争用。

```
static bool ttwu_queue_wakelist(struct task_struct *p, int cpu, int wake_flags)
{
	if (sched_feat(TTWU_QUEUE) && ttwu_queue_cond(cpu, wake_flags)) {
		if (WARN_ON_ONCE(cpu == smp_processor_id()))
			return false;

		sched_clock_cpu(cpu); /* Sync clocks across CPUs */
		__ttwu_queue_wakelist(p, cpu, wake_flags);
		return true;
	}

	return false;
}
```


### SIS_PROP

### WARN_DOUBLE_CLOCK


### RT_PUSH_IPI


### RT_RUNTIME_SHARE


### LB_MIN


### ATTACH_AGE_LOAD


### WA_IDLE
### WA_WEIGHT
### WA_BIAS
