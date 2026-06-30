---
title: fair
date: 2021-04-30 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
slug: "schedule/fair"
---








## reweight_entity
sched_init()->|
              |->set_load_weight(p, false)
sched_fork()->|


set_user_nice()--------->|
                         |->set_load_weight(p, true)->reweight_task()->reweight_entity()
__setscheduler_params()->|

只会在 cfs task改变 task nice值 或者 改变调度参数的时候会 调用到 `reweight_entity()`

```
static void reweight_entity(struct cfs_rq *cfs_rq, struct sched_entity *se,
			    unsigned long weight, unsigned long runnable)
{
	if (se->on_rq) {
		/* commit outstanding execution time */
		if (cfs_rq->curr == se)
			update_curr(cfs_rq);
		account_entity_dequeue(cfs_rq, se);
		dequeue_runnable_load_avg(cfs_rq, se);
	}
	dequeue_load_avg(cfs_rq, se);

	se->runnable_weight = runnable;
	update_load_set(&se->load, weight);

#ifdef CONFIG_SMP
	do {
		u32 divider = LOAD_AVG_MAX - 1024 + se->avg.period_contrib;

		se->avg.load_avg = div_u64(se_weight(se) * se->avg.load_sum, divider);
		se->avg.runnable_load_avg =
			div_u64(se_runnable(se) * se->avg.runnable_load_sum, divider);
	} while (0);
#endif

	enqueue_load_avg(cfs_rq, se);
	if (se->on_rq) {
		account_entity_enqueue(cfs_rq, se);
		enqueue_runnable_load_avg(cfs_rq, se);
	}
}
```
由于重新计算 load_weight，所以需要 xx_dequeue() and xx_enqueue()。









