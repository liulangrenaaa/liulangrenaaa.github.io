---
title: sched_domain and root_domain
date: 2021-04-12 19:00:00
tags:
    - schedule
categories:
    - linux kernel
    - linux schedule
---


## root_domain
`root_domain` 相对于 `sched_domain` 来说简单很多， 这是描述一个cpu集合的 数据结构。
每个 `cpuset` 都会拥有一个 `root_domain`，无论何时何地 `cpuset`被创建，同时会创建 并 attach 一个 root_domain结构。
一个  `root_domain` 可能包含多个cpu，且这些cpu的能效不一定是一致的，所以内嵌了`perf_domain` 结构来描述这种差异。

`perf_domain` 的`next` 指针 就这样将这个`root_domain` 中的`perf_domain` 连接起来了。
具有同一能效模型的俩cpu(在同一cluster上)，共享一个 `em_perf_domain` 能效模型结构，但是 `perf_domain`可能是分开的，因为这俩cpu可能是属于不同`root_domain`的。

参考 [kernel 文档](https://www.kernel.org/doc/html/latest/scheduler/sched-energy.html)
```
The lists are attached to the root domains in order to cope with exclusive cpuset configurations. Since the boundaries of exclusive cpusets do not necessarily match those of performance domains, the lists of different root domains can contain duplicate elements.

Example 1.
Let us consider a platform with 12 CPUs, split in 3 performance domains (pd0, pd4 and pd8), organized as follows:

CPUs:   0 1 2 3 4 5 6 7 8 9 10 11
PDs:   |--pd0--|--pd4--|---pd8---|
RDs:   |----rd1----|-----rd2-----|
Now, consider that userspace decided to split the system with two exclusive cpusets, hence creating two independent root domains, each containing 6 CPUs. The two root domains are denoted rd1 and rd2 in the above figure. Since pd4 intersects with both rd1 and rd2, it will be present in the linked list ‘->pd’ attached to each of them:
rd1->pd: pd0 -> pd4
rd2->pd: pd4 -> pd8

Please note that the scheduler will create two duplicate list nodes for pd4 (one for each list). However, both just hold a pointer to the same shared data structure of the EM framework.

Since the access to these lists can happen concurrently with hotplug and other things, they are protected by RCU, like the rest of topology structures manipulated by the scheduler.

EAS also maintains a static key (sched_energy_present) which is enabled when at least one root domain meets all conditions for EAS to start. Those conditions are summarized in Section 6.
```

这是 `root_domain` 实现：
```
struct perf_domain {
	struct em_perf_domain *em_pd;
	struct perf_domain *next;
	struct rcu_head rcu;
};

/*
 * We add the notion of a root-domain which will be used to define per-domain
 * variables. Each exclusive cpuset essentially defines an island domain by
 * fully partitioning the member CPUs from any other cpuset. Whenever a new
 * exclusive cpuset is created, we also create and attach a new root-domain
 * object.
 *
 */
struct root_domain {
	atomic_t		refcount;
	atomic_t		rto_count;
	struct rcu_head		rcu;
	cpumask_var_t		span;
	cpumask_var_t		online;

	/*
	 * Indicate pullable load on at least one CPU, e.g:
	 * - More than one runnable task
	 * - Running task is misfit
	 */
	int			overload;

	/* Indicate one or more cpus over-utilized (tipping point) */
	int			overutilized;

	/*
	 * The bit corresponding to a CPU gets set here if such CPU has more
	 * than one runnable -deadline task (as it is below for RT tasks).
	 */
	cpumask_var_t		dlo_mask;
	atomic_t		dlo_count;
	struct dl_bw		dl_bw;
	struct cpudl		cpudl;

#ifdef HAVE_RT_PUSH_IPI
	/*
	 * For IPI pull requests, loop across the rto_mask.
	 */
	struct irq_work		rto_push_work;
	raw_spinlock_t		rto_lock;
	/* These are only updated and read within rto_lock */
	int			rto_loop;
	int			rto_cpu;
	/* These atomics are updated outside of a lock */
	atomic_t		rto_loop_next;
	atomic_t		rto_loop_start;
#endif
	/*
	 * The "RT overload" flag: it gets set if a CPU has more than
	 * one runnable RT task.
	 */
	cpumask_var_t		rto_mask;
	struct cpupri		cpupri;

	unsigned long		max_cpu_capacity;

	/*
	 * NULL-terminated list of performance domains intersecting with the
	 * CPUs of the rd. Protected by RCU.
	 */
	struct perf_domain __rcu *pd;
};
```


## sched domain: WHAT?














## sched domain: 如何标识？
`include/linux/sched/sd_flags.h`

```
#define SDF_SHARED_CHILD       0x1
#define SDF_SHARED_PARENT      0x2
#define SDF_NEEDS_GROUPS       0x4
```


```
SD_FLAG(SD_BALANCE_NEWIDLE, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_BALANCE_EXEC, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_BALANCE_FORK, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_BALANCE_WAKE, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_WAKE_AFFINE, SDF_SHARED_CHILD)
SD_FLAG(SD_ASYM_CPUCAPACITY, SDF_SHARED_PARENT | SDF_NEEDS_GROUPS)
SD_FLAG(SD_SHARE_CPUCAPACITY, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_SHARE_PKG_RESOURCES, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_SERIALIZE, SDF_SHARED_PARENT | SDF_NEEDS_GROUPS)
SD_FLAG(SD_ASYM_PACKING, SDF_SHARED_CHILD | SDF_NEEDS_GROUPS)
SD_FLAG(SD_PREFER_SIBLING, SDF_NEEDS_GROUPS)
SD_FLAG(SD_OVERLAP, SDF_SHARED_PARENT | SDF_NEEDS_GROUPS)
SD_FLAG(SD_NUMA, SDF_SHARED_PARENT | SDF_NEEDS_GROUPS)
```


