---
title: walt
date: 2021-04-28 19:00:00
tags:
    - QCOM
categories:
    - QCOM
slug: "schedule/Qcom-kernel/walt"
---



## WHY?







## WHAT?
walt (Windows Assisted load tracking--窗口协助负载跟踪算法)，主要是跟踪过去一段时间内 entity，rq的负载，给++调频、预测负载、负载均衡++ 等一些调度行为提供一些参考。

## walt 数据结构

`struct walt_task_struct`
```
struct walt_task_struct {
	/*
	 * 'mark_start' marks the beginning of an event (task waking up, task
	 * starting to execute, task being preempted) within a window
	 *
	 * 'sum' represents how runnable a task has been within current
	 * window. It incorporates both running time and wait time and is
	 * frequency scaled.
	 *
	 * 'sum_history' keeps track of history of 'sum' seen over previous
	 * RAVG_HIST_SIZE windows. Windows where task was entirely sleeping are
	 * ignored.
	 *
	 * 'demand' represents maximum sum seen over previous
	 * sysctl_sched_ravg_hist_size windows. 'demand' could drive frequency
	 * demand for tasks.
	 *
	 * 'curr_window_cpu' represents task's contribution to cpu busy time on
	 * various CPUs in the current window
	 *
	 * 'prev_window_cpu' represents task's contribution to cpu busy time on
	 * various CPUs in the previous window
	 *
	 * 'curr_window' represents the sum of all entries in curr_window_cpu
	 *
	 * 'prev_window' represents the sum of all entries in prev_window_cpu
	 *
	 * 'pred_demand' represents task's current predicted cpu busy time
	 *
	 * 'busy_buckets' groups historical busy time into different buckets
	 * used for prediction
	 *
	 * 'demand_scaled' represents task's demand scaled to 1024
	 */
	u64				mark_start; // beginning of events(task start executing or waking up)
	u32				sum; // runnable time within a window
	u32				demand; // max sum in past serval(sysctl_sched_ravg_hist_size == 5) windows
	u32				coloc_demand;
	u32				sum_history[RAVG_HIST_SIZE_MAX];
	u32				*curr_window_cpu, *prev_window_cpu;
	u32				curr_window, prev_window;
	u32				pred_demand;
	u8				busy_buckets[NUM_BUSY_BUCKETS];
	u16				demand_scaled;
	u16				pred_demand_scaled;
	u64				active_time;
	int				boost;
	bool				wake_up_idle;
	bool				misfit;
	bool				rtg_high_prio;
	u8				low_latency;
	u64				boost_period;
	u64				boost_expires;
	u64				last_sleep_ts;
	u32				init_load_pct;
	u32				unfilter;
	u64				last_wake_ts;
	u64				last_enqueued_ts;
	struct walt_related_thread_group __rcu	*grp;
	struct list_head		grp_list;
	u64				cpu_cycles;
	cpumask_t			cpus_requested;
	bool				iowaited;
};

struct task_struct {
	......
	struct sched_entity		se;
	struct sched_rt_entity		rt;
#ifdef CONFIG_SCHED_WALT
	struct walt_task_struct		wts;
#endif
	......
};
```


`struct walt_rq`
```
struct walt_rq {
	struct task_struct	*push_task;
	struct walt_sched_cluster *cluster;
	struct cpumask		freq_domain_cpumask;
	struct walt_sched_stats walt_stats;

	u64			window_start;
	u32			prev_window_size;
	unsigned long		walt_flags;

	u64			avg_irqload;
	u64			last_irq_window;
	u64			prev_irq_time;
	struct task_struct	*ed_task;
	u64			task_exec_scale;
	u64			old_busy_time;
	u64			old_estimated_time;
	u64			curr_runnable_sum;
	u64			prev_runnable_sum;
	u64			nt_curr_runnable_sum;
	u64			nt_prev_runnable_sum;
	u64			cum_window_demand_scaled;
	struct group_cpu_time	grp_time;
	struct load_subtractions load_subs[NUM_TRACKED_WINDOWS];
	DECLARE_BITMAP_ARRAY(top_tasks_bitmap,
			NUM_TRACKED_WINDOWS, NUM_LOAD_INDICES);
	u8			*top_tasks[NUM_TRACKED_WINDOWS];
	u8			curr_table;
	int			prev_top;
	int			curr_top;
	bool			notif_pending;
	bool			high_irqload;
	u64			last_cc_update;
	u64			cycles;
};

struct rq {
#ifdef CONFIG_SCHED_WALT
	struct walt_rq		wrq;
#endif /* CONFIG_SCHED_WALT */
	......
}
```










## walt api使用

1. init
```
void walt_sched_init_rq(struct rq *rq)
{
	int j;

	if (cpu_of(rq) == 0)
		walt_init_once();

	cpumask_set_cpu(cpu_of(rq), &rq->wrq.freq_domain_cpumask);

	rq->wrq.walt_stats.cumulative_runnable_avg_scaled = 0;
	rq->wrq.prev_window_size = sched_ravg_window;
	rq->wrq.window_start = 0;
	rq->wrq.walt_stats.nr_big_tasks = 0;
    ......
}

void __init sched_init(void)
{
    ......
	for_each_possible_cpu(i) {
		struct rq *rq;
 		walt_sched_init_rq(rq);
    }
    ......
}
```

2. set_start()
```
void set_window_start(struct rq *rq)
{
	static int sync_cpu_available;

	if (likely(rq->wrq.window_start))
		return;
	if (!sync_cpu_available) {
		rq->wrq.window_start = 1;
        ......
    }
}
```

3. '

4. a
5.


### WALT TIME
由于存在多个cluster，不同 cluster的频率 和架构都不一样，所以同一 task在不同 cluster上运行，
需要的时间是不一样的。为了更好衡量一个 task的负载或者需求，我们必须考虑 cpu freq 和 ipc的差异，
所以需要将不同cpu 上运行的task时间 归一化 到同一个度量尺子上：
```
// delta 是 task实际 运行时间
// task_exec_scale 是task 执行时间的 刻度，每次在 update_task_rq_cpu_cycles 中更新
static inline u64 scale_exec_time(u64 delta, struct rq *rq)
{
	return (delta * rq->wrq.task_exec_scale) >> 10;
}

unsigned long topology_get_cpu_scale(int cpu)
{
	return per_cpu(cpu_scale, cpu);
}
#define arch_scale_cpu_capacity topology_get_cpu_scale

static void
update_task_rq_cpu_cycles(struct task_struct *p, struct rq *rq, int event,
			  u64 wallclock, u64 irqtime)
{
      rq->wrq.task_exec_scale = DIV64_U64_ROUNDUP(cpu_cur_freq(cpu) *
         	arch_scale_cpu_capacity(cpu),
         	rq->wrq.cluster->max_possible_freq);
}
```
			cur_freq
task_exec_scale  =    ------------ * scale_capacity
			max_freq

				cur_freq
scale_exec_time  =  delta *   ------------ * scale_capacity
				max_freq


`scale_capacity` 是driver 初始化的时候设置的。

### WALT update

`walt_update_task_ravg()` 是 walt的最主要输入，在各种`event` 下更新负载
```
enum task_event {
	PUT_PREV_TASK   = 0,
	PICK_NEXT_TASK  = 1,
	TASK_WAKE       = 2,
	TASK_MIGRATE    = 3,
	TASK_UPDATE     = 4,
	IRQ_UPDATE      = 5,
};

/* Reflect task activity on its demand and cpu's busy time statistics */
void walt_update_task_ravg(struct task_struct *p, struct rq *rq, int event,
						u64 wallclock, u64 irqtime)
{
	u64 old_window_start;

	// rq没有初始化 or task的 mark_start 与 wallclock相等==>刚刚才更新过
	if (!rq->wrq.window_start || p->wts.mark_start == wallclock)
		return;

	old_window_start = update_window_start(rq, wallclock, event); // 更新 rq->wrq.window_start，方便后面计算

	if (!p->wts.mark_start) {
		update_task_cpu_cycles(p, cpu_of(rq), wallclock);
		goto done;
	}

	update_task_rq_cpu_cycles(p, rq, event, wallclock, irqtime); // 更新 task_exec_scale
	// 更新 task的 demand 和 perd_demand 期望下一个window 的运行时间
	update_task_demand(p, rq, event, wallclock);
	update_cpu_busy_time(p, rq, event, wallclock, irqtime); //
	update_task_pred_demand(rq, p, event);
	if (event == PUT_PREV_TASK && p->state)
		p->wts.iowaited = p->in_iowait;

	trace_sched_update_task_ravg(p, rq, event, wallclock, irqtime,
				&rq->wrq.grp_time);
	trace_sched_update_task_ravg_mini(p, rq, event, wallclock, irqtime,
				&rq->wrq.grp_time);

done:
	p->wts.mark_start = wallclock;
//	void walt_irq_work(struct irq_work *irq_work)
	run_walt_irq_work(old_window_start, rq);
}
```

下面关注`update_task_demand()`
```
static u64 update_task_demand(struct task_struct *p, struct rq *rq,
			       int event, u64 wallclock)
{
	u64 mark_start = p->wts.mark_start;
	u64 delta, window_start = rq->wrq.window_start;
	int new_window, nr_full_windows;
	u32 window_size = sched_ravg_window;
	u64 runtime;

	new_window = mark_start < window_start;
	// window_start = rq->wrq.window_start 在之前俩函数已经更新过了，
	// 正常如果经历了新的window，new_window =1
	if (!account_busy_for_task_demand(rq, p, event)) {
		if (new_window)
			/*
			 * If the time accounted isn't being accounted as
			 * busy time, and a new window started, only the
			 * previous window need be closed out with the
			 * pre-existing demand. Multiple windows may have
			 * elapsed, but since empty windows are dropped,
			 * it is not necessary to account those.
			 */
			update_history(rq, p, p->wts.sum, 1, event);
		return 0;
	}

	// case: 没有经历新的window，p->wts.sum += delta， sum是保存所有不满一个 window的时间
	if (!new_window) {
		/*
		 * The simple case - busy time contained within the existing
		 * window.
		 */
		return add_to_task_demand(rq, p, wallclock - mark_start);
	}

	/*
	 * Busy time spans at least two windows. Temporarily rewind
	 * window_start to first window boundary after mark_start.
	 */
	delta = window_start - mark_start;
	nr_full_windows = div64_u64(delta, window_size);
	window_start -= (u64)nr_full_windows * (u64)window_size;

	/* Process (window_start - mark_start) first */
	runtime = add_to_task_demand(rq, p, window_start - mark_start);

	/* Push new sample(s) into task's demand history */
	update_history(rq, p, p->wts.sum, 1, event);
	if (nr_full_windows) {
		u64 scaled_window = scale_exec_time(window_size, rq);

		// 为啥这里没有 add_to_task_demand()? ,因为 更新demand也只是更新 p->wts.sum， 这里
		// 因为涉及多个 window，所以 sum肯定会超过一个window的时间。
		// 关注 update_history() 中的 p->wts.sum = 0;
		update_history(rq, p, scaled_window, nr_full_windows, event);
		runtime += nr_full_windows * scaled_window;
	}

	/*
	 * Roll window_start back to current to process any remainder
	 * in current window.
	 */
	window_start += (u64)nr_full_windows * (u64)window_size;

	/* Process (wallclock - window_start) next */
	mark_start = window_start;
	runtime += add_to_task_demand(rq, p, wallclock - mark_start);

	return runtime;
}
```
`add_to_task_demand()` 只是在 `scale-invariant`的尺度上将当前运行时间累计到 `task->wts.sum`上，`update_history()` 是 更新 `p->wts.sum_history[5]` 这个历史窗口的数据，类似不停地滚动，`update_history()`参数`runtime`也是 scale之后的，demand是根据不同的WINDOW_STATS_XXX决定的；然后根据 `predict_and_update_buckets()` 来预测 perd_demand需求，这里用到了buckets算法（不是重点）。









freq_policy_load() -- __cpu_util_freq_walt() -- cpu_util_freq_walt() -- schedutil 使用此接口去获得 cpu使用率



### walt 输出api
```
task_util()
```
```
以can_migrate_task()函数为例：

通过task_util()获取该task的demand，即task级负载

cpu_util_cum()获取cpu rq的累计demand，即cpu级负载

如果 dst_cpu累计demand + task_demand > src_cpu累计demand + task_demand，那么说明不满足迁移条件。
```