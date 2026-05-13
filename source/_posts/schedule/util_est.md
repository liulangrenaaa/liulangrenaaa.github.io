---
title: util_est
date: 2021-04-30 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
---

## WHAT?
`struct util_est - Estimation utilization of FAIR tasks`
这是一个评估 `fair` task的 utilization的结构

```
   It's worth noting that the estimated utilization is tracked only for
    objects of interests, specifically:

     - Tasks: to better support tasks placement decisions
     - root cfs_rqs: to better support both tasks placement decisions as
                     well as frequencies selection
```

```
   Moreover, the PELT utilization of a task can be updated every [ms], thus
    making it a continuously changing value for certain longer running
    tasks. This means that the instantaneous PELT utilization of a RUNNING
    task is not really meaningful to properly support scheduler decisions.

    For all these reasons, a more stable signal can do a better job of
    representing the expected/estimated utilization of a task/cfs_rq.
    Such a signal can be easily created on top of PELT by still using it as
    an estimator which produces values to be aggregated on meaningful
    events.
```
## 数据结构


```
/**
 * struct util_est - Estimation utilization of FAIR tasks
 * @enqueued: instantaneous estimated utilization of a task/cpu -- task的 瞬时的 util
 * @ewma:     the Exponential Weighted Moving Average (EWMA)
 *            utilization of a task                             -- task的 EWMA（移动加权平均） 的 util
 *
 * Support data structure to track an Exponential Weighted Moving Average
 * (EWMA) of a FAIR task's utilization. New samples are added to the moving
 * average each time a task completes an activation. Sample's weight is chosen
 * so that the EWMA will be relatively insensitive to transient changes to the
 * task's workload.
 *
 * The enqueued attribute has a slightly different meaning for tasks and cpus:
 * - task:   the task's util_avg at last task dequeue time
 * - cfs_rq: the sum of util_est.enqueued for each RUNNABLE task on that CPU
 * Thus, the util_est.enqueued of a task represents the contribution on the
 * estimated utilization of the CPU where that task is currently enqueued.
 *
 * Only for tasks we track a moving average of the past instantaneous
 * estimated utilization. This allows to absorb sporadic drops in utilization
 * of an otherwise almost periodic task.
 */
struct util_est {
	unsigned int			enqueued;
	unsigned int			ewma;
#define UTIL_EST_WEIGHT_SHIFT		2
} __attribute__((__aligned__(sizeof(u64))));
```

当一个 `task` 完成一次激活（？？enqueue?）的时候，最新的采样会被 加权之后添加到 EWMA中；因为会对 `sample` 做一个加权，所以 `EWMA` 对 `task workload`的瞬时量不会态敏感。

`.enqueue` 这个含义对 `task` 与 `cpu` 有些不一样:
`task`: 在上次 dequeue时刻，task的 util_avg
`cfs_rq`: 在 这个cpu上 所有 `RUNNABLE task`的 `util_est.enqueued`之和

我们只对 `tasks` 跟踪 过去瞬时的 util，不会对 `cpu`跟踪这个。




## API
`util_est` 对外部只提供了四个API
```
static inline void util_est_enqueue(struct cfs_rq *cfs_rq,
				    struct task_struct *p);

static inline void util_est_dequeue(struct cfs_rq *cfs_rq,
				    struct task_struct *p);

static inline void util_est_update(struct cfs_rq *cfs_rq,
				   struct task_struct *p,
				   bool task_sleep);

static inline void cfs_se_util_change(struct sched_avg *avg);
```


`util_est_enqueue` `util_est_dequeue` 都是只在 `enqueue_task_fair` `dequeue_task_fair` 中使用。


```
static void
enqueue_task_fair(struct rq *rq, struct task_struct *p, int flags)
{
	struct cfs_rq *cfs_rq;
	struct sched_entity *se = &p->se;
	int idle_h_nr_running = task_has_idle_policy(p);
	int task_new = !(flags & ENQUEUE_WAKEUP);

	/*
	 * The code below (indirectly) updates schedutil which looks at
	 * the cfs_rq utilization to select a frequency.
	 * Let's add the task's estimated utilization to the cfs_rq's
	 * estimated utilization, before we update schedutil.
	 */
	util_est_enqueue(&rq->cfs, p);
    ......
}

static void dequeue_task_fair(struct rq *rq, struct task_struct *p, int flags)
{
	struct cfs_rq *cfs_rq;
	struct sched_entity *se = &p->se;
	int task_sleep = flags & DEQUEUE_SLEEP;
	int idle_h_nr_running = task_has_idle_policy(p);
	bool was_sched_idle = sched_idle_rq(rq);

	util_est_dequeue(&rq->cfs, p);
    ......

dequeue_throttle:
	util_est_update(&rq->cfs, p, task_sleep);
	hrtick_update(rq);
}
```

`enqueue_task_fair` 中调用 `util_est_enqueue` 时，此时 task->entity 还未 入队
`dequeue_task_fair` 中调用 `util_est_dequeue` 时，此时 task->entity 还未 出队


在 `enqueue_task_fair` `dequeue_task_fair` 中，会对 `entity` 进行 `enqueue_entity` 和 `dequeue_entity`，两个过程都需要 `update_load_avg`，


```
static inline void cfs_se_util_change(struct sched_avg *avg)
{
	unsigned int enqueued;

	if (!sched_feat(UTIL_EST))
		return;

	/* Avoid store if the flag has been already set */
	enqueued = avg->util_est.enqueued;
	if (!(enqueued & UTIL_AVG_UNCHANGED))
		return;

	/* Reset flag to report util_avg has been updated */
	enqueued &= ~UTIL_AVG_UNCHANGED;
	WRITE_ONCE(avg->util_est.enqueued, enqueued);
}

int __update_load_avg_se(u64 now, struct cfs_rq *cfs_rq, struct sched_entity *se)
{
	if (___update_load_sum(now, &se->avg, !!se->on_rq, se_runnable(se),
				cfs_rq->curr == se)) {

		___update_load_avg(&se->avg, se_weight(se));
		cfs_se_util_change(&se->avg);
		trace_pelt_se_tp(se);
		return 1;
	}

	return 0;
}

static inline void update_load_avg(struct cfs_rq *cfs_rq, struct sched_entity *se, int flags)
{
	u64 now = cfs_rq_clock_pelt(cfs_rq);
	int decayed;

	/*
	 * Track task load average for carrying it to new CPU after migrated, and
	 * track group sched_entity load average for task_h_load calc in migration
	 */
	if (se->avg.last_update_time && !(flags & SKIP_AGE_LOAD))
		__update_load_avg_se(now, cfs_rq, se);
    ......
}
```



所以一个 task `enqueue` `dequeue` 两个过程 和 util_est相关的流程是
```
enqueue_task_fair
    |
    util_est_enqueue
    |
    enqueue_entity
        |
        update_load_avg
            |
            __update_load_avg_se
                |
                cfs_se_util_change

......

dequeue_task_fair
    |
    util_est_dequeue
    |
    enqueue_entity
        |
        update_load_avg
            |
            __update_load_avg_se
                |
                cfs_se_util_change
    |
    util_est_update
```

都是先要经过 `cfs_se_util_change` 然后再经过 `dequeue_task_fair` 中的`util_est_update` ，在 `util_est_update` 中更新 EWMA的值。

内部实现使用了 `UTIL_AVG_UNCHANGED` 这个变量来同步这两个过程。

```
/*
 * When a task is dequeued, its estimated utilization should not be update if
 * its util_avg has not been updated at least once.
 * This flag is used to synchronize util_avg updates with util_est updates.
 * We map this information into the LSB bit of the utilization saved at
 * dequeue time (i.e. util_est.dequeued).
 */
```

## EWMA是啥？

参考[EWMA](https://baike.baidu.com/item/EWMA)

EWMA - Exponential Weighted Moving Average 指数加权移动平均。



ewma(t) = w *  task_util(p) + (1-w) * ewma(t-1)
        = w *  task_util(p) +         ewma(t-1)  - w * ewma(t-1)
        = w * (task_util(p) -         ewma(t-1)) +     ewma(t-1)
        = w * (      last_ewma_diff            ) +     ewma(t-1)
        = w * (last_ewma_diff  +  ewma(t-1) / w)

其中 w = 0.25 = 1 / 4

ewma(t) = (last_ewma_diff + ewma(t-1) << 2)   >> 2
        = (last_ewma_diff + ewma(t-1) << UTIL_EST_WEIGHT_SHIFT)   >> UTIL_EST_WEIGHT_SHIFT

当前 采样周期只占用到了 (1 / 4) 权重

## 优化
为了更快追踪负载的变化，util_est 作者引入了另一个 feature `UTIL_EST_FASTUP`, 用来加速 util上升
```
    sched/fair/util_est: Implement faster ramp-up EWMA on utilization increases

    The estimated utilization for a task:

       util_est = max(util_avg, est.enqueue, est.ewma)

    is defined based on:

     - util_avg: the PELT defined utilization
     - est.enqueued: the util_avg at the end of the last activation
     - est.ewma:     a exponential moving average on the est.enqueued samples

    According to this definition, when a task suddenly changes its bandwidth
    requirements from small to big, the EWMA will need to collect multiple
    samples before converging up to track the new big utilization.

    This slow convergence towards bigger utilization values is not
    aligned to the default scheduler behavior, which is to optimize for
    performance. Moreover, the est.ewma component fails to compensate for
    temporarely utilization drops which spans just few est.enqueued samples.

    To let util_est do a better job in the scenario depicted above, change
    its definition by making util_est directly follow upward motion and
    only decay the est.ewma on downward.
```

主要改动是这里
```
--- a/kernel/sched/fair.c
+++ b/kernel/sched/fair.c
@@ -3768,11 +3768,22 @@ util_est_dequeue(struct cfs_rq *cfs_rq, struct task_struct *p, bool task_sleep)
        if (ue.enqueued & UTIL_AVG_UNCHANGED)
                return;

+       /*
+        * Reset EWMA on utilization increases, the moving average is used only
+        * to smooth utilization decreases.
+        */
+       ue.enqueued = (task_util(p) | UTIL_AVG_UNCHANGED);
+       if (sched_feat(UTIL_EST_FASTUP)) {
+               if (ue.ewma < ue.enqueued) {
+                       ue.ewma = ue.enqueued;
+                       goto done;
+               }
+       }
+
```
开启 `UTIL_EST_FASTUP` 之后， 如果检测到 ewma(t-1) < .enqueued 直接用当前的 负载util 替换掉
历史负载 ewma.

这样task 在 `small_to_big` 的时候可以更快的跟踪负载，从而更好地 调频与 升核。
