---
title: pelt
date: 2021-04-24 19:00:00
tags:
    - 进程调度
categories:
    - linux内核
slug: "schedule/pelt"
---


参考[wowo文章](http://www.wowotech.net/process_management/450.html)









## WHY?

为了让调度器更加的聪明，我们总是希望系统满足最大吞吐量同时又最大限度的降低功耗。虽然可能有些矛盾，但是现实总是这样。PELT算法是Linux 3.8合入的，那么在此之前，我们存在什么问题才引入PELT算法呢？在Linux 3.8之前，CFS以每个运行队列（runqueue，简称rq）为基础跟踪负载。但是这种方法，我们无法确定当前负载的来源。同时，即使工作负载相对稳定的情况下，在rq级别跟踪负载，其值也会产生很大变化。为了解决以上的问题，PELT算法会跟踪每个调度实体（per-scheduling entity）的负载情况。

## HOW?
为了做到Per-entity的负载跟踪，时间（物理时间，不是虚拟时间）被分成了1024us的序列，在每一个1024us的周期中，一个entity对系统负载的贡献可以根据该实体处于runnable状态（正在CPU上运行或者等待cpu调度运行）的时间进行计算。

如果在该周期内，runnable的时间是x，那么对系统负载的贡献就是（x/1024）。当然，一个实体在一个计算周期内的负载可能会超过1024us，这是因为我们会累积在过去周期中的负载，当然，对于过去的负载我们在计算的时候需要乘一个衰减因子。如果我们让Li表示在周期pi中该调度实体的对系统负载贡献，那么一个调度实体对系统负荷的总贡献可以表示为：
```
L = L0 + L1 * y + L2 * y2 + L3 * y3 + ... + Ln * yn

其中：y32 = 0.5, y = 0.97857206
```

如果有一个task，从第一次加入rq后开始一直运行4096us后一直睡眠，那么在1023us、2047us、3071us、4095us、5119us、6143us、7167us和8191us时间的每一个时刻负载贡献分别是多少呢？
        /\
        |
       1|-----------------------|
        |                       |
       0|                       |------------------------------------------
------------------------------------------------------------------------------->
                |       |       |       |       |       |       |       |
              1023    2047    4095    5119    7167    8191

可以计算：
```
L0 = 1023 * y0 = 1023
L1 = 1023 * y0 + 1024 * y1 = 1023 + (L0 + 1) * y = 2025
L2 = 1023 * y0 + 1024 * y1 + 1024 * y2 = 1023 + (L1 + 1) * y1 = 3005
......
```

可以得到：
```
Ln = Load(This)  + Ln-1 * y =  当前周期负载 + 上一周期负载 * 衰减系数y
```

需要经常计算 Ln-1 * y的值，但是内核并不是 简单计算  Ln-1 * y，也可能需要计算
Ln-m * ym，kernel中使用decay_laod()函数。
为了提高精度和计算速度，采用乘法  和 位移算法进行计算，输入是:
1. val: 前n个负载计算周期的负载
2. n: 衰减n个周期之后的实际负载
```
decay_load(val, n) = val * yn = (val * yn) * (232 >>32)
                              = val * (yn * 232) >>  32

```

可以看到 yn * 232的值其实是固定的（n确定的情况下是一个数组）
`runnable_avg_yN_inv[n] = yn*232, n > 0 && n < 32`
kernel中使用了一个数组来保存这些值：
```
static const u32 runnable_avg_yN_inv[] = {
	0xffffffff, 0xfa83b2da, 0xf5257d14, 0xefe4b99a, 0xeac0c6e6, 0xe5b906e6,
	0xe0ccdeeb, 0xdbfbb796, 0xd744fcc9, 0xd2a81d91, 0xce248c14, 0xc9b9bd85,
	0xc5672a10, 0xc12c4cc9, 0xbd08a39e, 0xb8fbaf46, 0xb504f333, 0xb123f581,
	0xad583ee9, 0xa9a15ab4, 0xa5fed6a9, 0xa2704302, 0x9ef5325f, 0x9b8d39b9,
	0x9837f050, 0x94f4efa8, 0x91c3d373, 0x8ea4398a, 0x8b95c1e3, 0x88980e80,
	0x85aac367, 0x82cd8698,
};
```

下面是`decay_load`实际代码：
1. 如果衰减周期大于 `LOAD_AVG_PERIOD * 63`，那么我们认为`LOAD_AVG_PERIOD * 63`之前的负载val对现在的贡献是 0
2. 如果`n >= 32`，由于 `runnable_avg_yN_inv` 只包含了y31的值，所以 必须将n 归一化到 `< 32`，每归一化一次，负载贡献就减半 (val = val >> 1)
3. 最后衰减的负载是 `val * runnable_avg_yN_inv[local_n] >> 32`
```
/*
 * Approximate:
 *   val * y^n,    where y^32 ~= 0.5 (~1 scheduling period)
 */
static u64 decay_load(u64 val, u64 n)
{
	unsigned int local_n;

	if (unlikely(n > LOAD_AVG_PERIOD * 63))
		return 0;

	/* after bounds checking we can collapse to 32-bit */
	local_n = n;

	/*
	 * As y^PERIOD = 1/2, we can combine
	 *    y^n = 1/2^(n/PERIOD) * y^(n%PERIOD)
	 * With a look-up table which covers y^n (n<PERIOD)
	 *
	 * To achieve constant time decay_load.
	 */
	if (unlikely(local_n >= LOAD_AVG_PERIOD)) {
		val >>= local_n / LOAD_AVG_PERIOD;
		local_n %= LOAD_AVG_PERIOD;
	}

	val = mul_u64_u32_shr(val, runnable_avg_yN_inv[local_n], 32);
	return val;
}
```

## 负载信息如何记录？

首先负载计算是相对于`调度实体se 和  就绪队列rq`的：
对于 `struct sched_entity`  `struct cfs_rq` `struct rq` 结构来说都内嵌了 `struct sched_avg` 结构。
```
struct sched_avg {
	u64				last_update_time; // 上一次负载更新的时间
	u64				load_sum; // running + runnable 的负载
	u64				runnable_load_sum;// 姑且等于 load_sum
	u32				util_sum; // running 的负载
	u32				period_contrib;
	unsigned long			load_avg; // running + runnable 的平均负载
	unsigned long			runnable_load_avg; // 姑且等于 load_avg
	unsigned long			util_avg; // running 的平均负载
};

struct sched_entity {
      	struct load_weight		load;
	unsigned long			runnable_weight;
#ifdef CONFIG_SMP
	/*
	 * Per entity load average tracking.
	 *
	 * Put into separate cache line so it does not
	 * collide with read-mostly values above.
	 */
	struct sched_avg		avg;
#endif
};

struct cfs_rq {
	struct load_weight	load;
	unsigned long		runnable_weight;
#ifdef CONFIG_SMP
	/*
	 * CFS load tracking
	 */
	struct sched_avg	avg;
#ifndef CONFIG_64BIT
};

struct rq {
	/* runqueue lock: */
	raw_spinlock_t		lock;

	/*
	 * nr_running and cpu_load should be in the same cacheline because
	 * remote CPUs use both these fields when doing load calculation.
	 */
	unsigned int		nr_running;
	struct sched_avg	avg_rt;
	struct sched_avg	avg_dl;
#ifdef CONFIG_HAVE_SCHED_AVG_IRQ
	struct sched_avg	avg_irq;
#endif
};
```


通过init可以更清楚知道他们含义，如果`se`是：
1. `task`，那么 runnable_load_avg = load_avg 都和 se的权重相等
2. `group se`，runnable_load_avg = load_avg = 0，也反映了此时`group se`还没有任何任务。
```
void init_entity_runnable_average(struct sched_entity *se)
{
	struct sched_avg *sa = &se->avg;

	memset(sa, 0, sizeof(*sa));

	/*
	 * Tasks are initialized with full load to be seen as heavy tasks until
	 * they get a chance to stabilize to their real load level.
	 * Group entities are initialized with zero load to reflect the fact that
	 * nothing has been attached to the task group yet.
	 */
	if (entity_is_task(se))
		sa->runnable_load_avg = sa->load_avg = scale_load_down(se->load.weight);

	se->runnable_weight = se->load.weight;

	/* when this task enqueue'ed, it will contribute to its cfs_rq's load_avg */
}
```


## 那么如何计算当前se的负载？

假设一个task从0时刻一直开始运行，在1022us时刻负载是多少？
由于还没有之前运行周期可以凑满1024us 一个衰减周期，所以负载是1022，
又运行了10us之后负载应该如何计算？
```
L  = (10 - (1024 - 1022)) +(1024 - 1022 + 1022)y
   = (10 -2) + (1022 + 2) * y1
   = 8 +  1024 *  y1
```

假设上一时刻负载贡献是u，经历d时间后的负载贡献如何计算呢？根据上面的例子，我们可以把时间d分成3和部分：
d1是离当前时间最远（不完整的）period 的剩余部分，d2 是完整period时间，而d3是（不完整的）当前 period 的剩余部分。
假设时间d是经过p个周期（d=d1+d2+d3, p=1+d2/1024）。d1，d2，d3 的示意图如下：

```
      d1          d2           d3
      ^           ^            ^
      |           |            |
    |<->|<----------------->|<--->|
|---x---|------| ... |------|-----x (now)
    |
   u时刻

u'  = (u + d1) y^p + 1024 * (y^1 + y^2 + ...  + y^p-1) + d3 * y^0
                           p-1
    = (u + d1) y^p + 1024 \Sum y^n + d3 y^0
                           n=1

    = u y^p +                                 ---> Step1
                     p-1
    = d1 y^p + 1024 \Sum y^n + d3 y^0         ---> Step2
                     n=1
```


kernel中是用 `accumulate_sum()` 实现这个当前时刻负载计算的
1. period_contrib记录的是上次更新负载不足1024us周期的时间。delta是经过的时间，为了计算经过的周期个数需要加上period_contrib，然后整除1024。
2. 计算周期个数
3. 调用decay_load()函数计算公式中的step1部分
4. __accumulate_pelt_segments()负责计算公式step2部分
5. 更新period_contrib为本次不足1024us部分
```
static u32 __accumulate_pelt_segments(u64 periods, u32 d1, u32 d3)
{
	u32 c1, c2, c3 = d3; /* y^0 == 1 */

	/*
	 * c1 = d1 y^p
	 */
	c1 = decay_load((u64)d1, periods);

	/*
	 *            p-1
	 * c2 = 1024 \Sum y^n
	 *            n=1
	 *
	 *              inf        inf
	 *    = 1024 ( \Sum y^n - \Sum y^n - y^0 )
	 *              n=0        n=p
	 */
	c2 = LOAD_AVG_MAX - decay_load(LOAD_AVG_MAX, periods) - 1024;

	return c1 + c2 + c3;
}

/*
 * Accumulate the three separate parts of the sum; d1 the remainder
 * of the last (incomplete) period, d2 the span of full periods and d3
 * the remainder of the (incomplete) current period.
 *
 *           d1          d2           d3
 *           ^           ^            ^
 *           |           |            |
 *         |<->|<----------------->|<--->|
 * ... |---x---|------| ... |------|-----x (now)
 *
 *                           p-1
 * u' = (u + d1) y^p + 1024 \Sum y^n + d3 y^0
 *                           n=1
 *
 *    = u y^p +					(Step 1)
 *
 *                     p-1
 *      d1 y^p + 1024 \Sum y^n + d3 y^0		(Step 2)
 *                     n=1
 */
static __always_inline u32
accumulate_sum(u64 delta, struct sched_avg *sa,
	       unsigned long load, unsigned long runnable, int running)
{
	u32 contrib = (u32)delta; /* p == 0 -> delta < 1024 */
	u64 periods;

	delta += sa->period_contrib;
	periods = delta / 1024; /* A period is 1024us (~1ms) */

	/*
	 * Step 1: decay old *_sum if we crossed period boundaries.
	 */
	if (periods) {
		sa->load_sum = decay_load(sa->load_sum, periods);
		sa->runnable_load_sum =
			decay_load(sa->runnable_load_sum, periods);
		sa->util_sum = decay_load((u64)(sa->util_sum), periods);

		/*
		 * Step 2
		 */
		delta %= 1024;
		contrib = __accumulate_pelt_segments(periods,
				1024 - sa->period_contrib, delta);
	}
	sa->period_contrib = delta;

	if (load)
		sa->load_sum += load * contrib;
	if (runnable)
		sa->runnable_load_sum += runnable * contrib;
	if (running)
		sa->util_sum += contrib << SCHED_CAPACITY_SHIFT;

	return periods;
}
```





其中 `___update_load_sum()` 函数 计算的都是*sum*负载总和，函数返回值是
1. 0，如果和上次更新时间之间 没有 经历过一次完整的period
2. 1，如果和上次更新时间之间 经历过一次完整的period

如果经历过一个 `full period`之后，就需要更新 `load_avg`。
```
static __always_inline void
___update_load_avg(struct sched_avg *sa, unsigned long load, unsigned long runnable)
{
	u32 divider = LOAD_AVG_MAX - 1024 + sa->period_contrib;

	/*
	 * Step 2: update *_avg.
	 */
	sa->load_avg = div_u64(load * sa->load_sum, divider);
	sa->runnable_load_avg =	div_u64(runnable * sa->runnable_load_sum, divider);
	WRITE_ONCE(sa->util_avg, sa->util_sum / divider);
}

int __update_load_avg_se(u64 now, struct cfs_rq *cfs_rq, struct sched_entity *se)
{
	if (___update_load_sum(now, &se->avg, !!se->on_rq, !!se->on_rq,
				cfs_rq->curr == se)) {

		___update_load_avg(&se->avg, se_weight(se), se_runnable(se));
		cfs_se_util_change(&se->avg);
		trace_pelt_se_tp(se);
		return 1;
	}

	return 0;
}
```
					      |<--1024-->|
|---------------------------------------------|---|------|
					      |-|-|
					  period_contrib

divider = LOAD_AVG_MAX - (1024 - period_contrib)
	= LOAD_AVG_MAX - 1024 + period_contrib

可以大概理解：
```
load_avg = load_weight * (load_sum /  time_sum)
util_avg = util_sum / time_sum
```


当一个task一直运行，负载足够高时，可以认为
```
load_sum ==  time_sum
util_sum == time_sum
load_avg = load_weight
util_avg = 1
```

## 如何计算当前cfs_rq的负载

我们跟踪`se`的负载，更多的想更精确的知道每时每刻 `rq`上有负载变化，从而对scheduler的行为作出指导。
```
int __update_load_avg_cfs_rq(u64 now, struct cfs_rq *cfs_rq)
{
	if (___update_load_sum(now, &cfs_rq->avg,
				scale_load_down(cfs_rq->load.weight),
				scale_load_down(cfs_rq->runnable_weight),
				cfs_rq->curr != NULL)) {

		___update_load_avg(&cfs_rq->avg, 1, 1);
		trace_pelt_cfs_tp(cfs_rq);
		return 1;
	}

	return 0;
}


/**
 * update_cfs_rq_load_avg - update the cfs_rq's load/util averages
 * @now: current time, as per cfs_rq_clock_pelt()
 * @cfs_rq: cfs_rq to update
 *
 * The cfs_rq avg is the direct sum of all its entities (blocked and runnable)
 * avg. The immediate corollary is that all (fair) tasks must be attached, see
 * post_init_entity_util_avg().
 *
 * cfs_rq->avg is used for task_h_load() and update_cfs_share() for example.
 *
 * Returns true if the load decayed or we removed load.
 *
 * Since both these conditions indicate a changed cfs_rq->avg.load we should
 * call update_tg_load_avg() when this function returns true.
 */
 /*
 * cfs_rq avg 是 cfs_rq中所有 entities 的 sum。
 * 返回值：1 如果 有线程被移出这个 cfs_rq 或者经过了一个衰减周期
 *        0
 */
static inline int
update_cfs_rq_load_avg(u64 now, struct cfs_rq *cfs_rq)
{
	unsigned long removed_load = 0, removed_util = 0, removed_runnable_sum = 0;
	struct sched_avg *sa = &cfs_rq->avg;
	int decayed = 0;

	if (cfs_rq->removed.nr) {
		unsigned long r;
		u32 divider = LOAD_AVG_MAX - 1024 + sa->period_contrib;

		raw_spin_lock(&cfs_rq->removed.lock);
		swap(cfs_rq->removed.util_avg, removed_util);
		swap(cfs_rq->removed.load_avg, removed_load);
		swap(cfs_rq->removed.runnable_sum, removed_runnable_sum);
		cfs_rq->removed.nr = 0;
		raw_spin_unlock(&cfs_rq->removed.lock);

		r = removed_load;
		sub_positive(&sa->load_avg, r);
		sub_positive(&sa->load_sum, r * divider);

		r = removed_util;
		sub_positive(&sa->util_avg, r);
		sub_positive(&sa->util_sum, r * divider);

		add_tg_cfs_propagate(cfs_rq, -(long)removed_runnable_sum);

		decayed = 1;
	}

	decayed |= __update_load_avg_cfs_rq(now, cfs_rq);

#ifndef CONFIG_64BIT
	smp_wmb();
	cfs_rq->load_last_update_time_copy = sa->last_update_time;
#endif

	return decayed;
}
```