---
title: uclamp
date: 2021-05-01 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
slug: "schedule/uclamp"
---



## WHAT?
uclamp(utilzation clamp) 是说 任务 cpu使用率夹钳，主要是 userspace 对 scheduler的一些hint。
1. 比如某个 task 对用户体验有直接的影响，此 task至少需要 20%cpu，那么计算 cpu使用率，select_rq的时候，必须考虑此task的 minimum "requested"，然后选择 `rq` 和 `freq`。
2. 比如某个低优先级的 task 对用户体验没有影响，此 task最多需要 60%cpu（60% < 1024），那么计算 cpu使用率，select_rq的时候，必须考虑此task的 maximum "requested"，然后选择 `rq` 和`freq`。

```
sched/cpufreq, sched/uclamp: Add clamps for FAIR and RT tasks

    Each time a frequency update is required via schedutil, a frequency is
    selected to (possibly) satisfy the utilization reported by each
    scheduling class and irqs. However, when utilization clamping is in use,
    the frequency selection should consider userspace utilization clamping
    hints.  This will allow, for example, to:

     - boost tasks which are directly affecting the user experience
       by running them at least at a minimum "requested" frequency

     - cap low priority tasks not directly affecting the user experience
       by running them only up to a maximum "allowed" frequency
```

在uapi 的头文件`include/uapi/linux/sched/types.h`中
```
  @sched_util_min	represents the minimum utilization
  @sched_util_max	represents the maximum utilization

 Utilization is a value in the range [0..SCHED_CAPACITY_SCALE]. It
 represents the percentage of CPU time used by a task when running at the
 maximum frequency on the highest capacity CPU of the system. For example, a
 20% utilization task is a task running for 2ms every 10ms at maximum
 frequency.

 A task with a min utilization value bigger than 0 is more likely scheduled
 on a CPU with a capacity big enough to fit the specified value.
 A task with a max utilization value smaller than 1024 is more likely
 scheduled on a CPU with no more capacity than the specified value.
```

uclamp 的min..max 指的都是最大 freq下 的cpu使用率， 20%使用率 说的是在最大频率下，task 每10ms需要运行2ms。

## data structure
uclamp 分为`per sched_entity` 和 `per rq` 两种，分别使用 `struct uclamp_se`  `struct uclamp_rq`来描述。

```
struct uclamp_se {
	unsigned int value		: bits_per(SCHED_CAPACITY_SCALE);
	unsigned int bucket_id		: bits_per(UCLAMP_BUCKETS);
	unsigned int active		: 1;
	unsigned int user_defined	: 1;
};

struct uclamp_rq {
	unsigned int value;
	struct uclamp_bucket bucket[UCLAMP_BUCKETS];
};

struct rq {
	/* runqueue lock: */
	raw_spinlock_t		lock;
#ifdef CONFIG_UCLAMP_TASK
	/* Utilization clamp values based on CPU's RUNNABLE tasks */
	struct uclamp_rq	uclamp[UCLAMP_CNT] ____cacheline_aligned;
	unsigned int		uclamp_flags;
#define UCLAMP_FLAG_IDLE 0x01
#endif
}
```

`per sched entity` 又分为两种，一种是 `per task`，一种是 `per task group`。
```
struct task_struct {
        ......
#ifdef CONFIG_UCLAMP_TASK
	/* Clamp values requested for a scheduling entity */
	struct uclamp_se		uclamp_req[UCLAMP_CNT];
	/* Effective clamp values used for a scheduling entity */
	struct uclamp_se		uclamp[UCLAMP_CNT];
#endif
        ......
}

struct task_group {
	struct cgroup_subsys_state css;
#ifdef CONFIG_UCLAMP_TASK_GROUP
	/* The two decimal precision [%] value requested from user-space */
	unsigned int		uclamp_pct[UCLAMP_CNT];
	/* Clamp values requested for a task group */
	struct uclamp_se	uclamp_req[UCLAMP_CNT];
	/* Effective clamp values used for a task group */
	struct uclamp_se	uclamp[UCLAMP_CNT];
#endif
};
```


## api
### init
```
static void __init init_uclamp(void)
{
	struct uclamp_se uc_max = {};
	enum uclamp_id clamp_id;
	int cpu;

	mutex_init(&uclamp_mutex);

	for_each_possible_cpu(cpu)
		init_uclamp_rq(cpu_rq(cpu));

	for_each_clamp_id(clamp_id) {
		uclamp_se_set(&init_task.uclamp_req[clamp_id],
			      uclamp_none(clamp_id), false);
	}

	/* System defaults allow max clamp values for both indexes */
	uclamp_se_set(&uc_max, uclamp_none(UCLAMP_MAX), false);
	for_each_clamp_id(clamp_id) {
		uclamp_default[clamp_id] = uc_max;
	}
}
```


### kernel api
```
static inline void uclamp_rq_inc(struct rq *rq, struct task_struct *p) { }
static inline void uclamp_rq_dec(struct rq *rq, struct task_struct *p) { }


static inline void enqueue_task(struct rq *rq, struct task_struct *p, int flags)
{
	if (!(flags & ENQUEUE_NOCLOCK))
		update_rq_clock(rq);

	if (!(flags & ENQUEUE_RESTORE)) {
		sched_info_queued(rq, p);
		psi_enqueue(p, flags & ENQUEUE_WAKEUP);
	}

	uclamp_rq_inc(rq, p);
	p->sched_class->enqueue_task(rq, p, flags);
}

static inline void dequeue_task(struct rq *rq, struct task_struct *p, int flags)
{
	if (!(flags & DEQUEUE_NOCLOCK))
		update_rq_clock(rq);

	if (!(flags & DEQUEUE_SAVE)) {
		sched_info_dequeued(rq, p);
		psi_dequeue(p, flags & DEQUEUE_SLEEP);
	}

	uclamp_rq_dec(rq, p);
	p->sched_class->dequeue_task(rq, p, flags);
}
```
在 `enqueue_task` `dequeue_task` 中会 根据 此task是否 开启 uclamp来更改 `rq`的统计的`uclamp_rq` 数据。

![](/images/image.jpg)


### user api
uclamp 在 `userspace` 提供了三类接口
+ 全局uclamp接口 `/proc/sys/kernel/sched_util_clamp_min` `/proc/sys/kernel/sched_util_clamp_max`
+ cgroup based API `cpu.uclamp.max` `cpu.uclamp.min`
+ per-task API

一般全局uclamp接口都是设置为 min-1024 max-1024。
cgroup 接口一般只会限制最大使用率
per-task的情况较为复杂，以pixel6为例：

在pixel6搭载的Android 12中，google去除了`schedtue` `sched boost`等机制，pixel6 且采用了双X1架构的芯片，没有使用walt算法。为了尽量提升用户流畅性体验，所以对uclamp较为依赖。

kernel space对外提供的接口是 `sched_setattr`, android 框架层对他做了封装[setUclamp](https://cs.android.com/android/platform/superproject/+/master:hardware/google/pixel/power-libperfmgr/aidl/PowerHintSession.cpp;bpv=1;bpt=1;l=181?q=sched_setattr)


在 `pixel6` 中使用 uclamp的场景大概分为以下几类:
+ 应用启动
+ 滑动boost
+ top-app

首先是应用启动，应用启动往往需要创建多个线程，读取很多资源。所以在应用冷启动时刻，除了将所有cpu的频率固定在最高频之外，还将应用的 `UI_thread` `Render_thread` `hwui_task0` `hwui_task1` uclamp直接设置为 512，这样会使得这几个重载线程在启动时刻就跑在超大核心上，减少应用冷启动时间。

滑动场景，由于滑动场景有较多复杂的动画，`UI_thread` `Render_thread` `hwui_task0` `hwui_task1`的负载较重，如果不及时上超大核，有丢帧的风险，所以滑动场景也是将这几个task的uclamp_min 设置为 512，来保证可以上超大核。


### 根据场景设置
在 pixel6 中，从代码中看 有 [powerhint.json](https://cs.android.com/android/platform/superproject/+/master:device/google/gs101/powerhint.json;l=120?q=ta_uclamp_min) 这个文件。

```
    {
      "Name": "TAUClampBoost",
      "Path": "/sys/kernel/vendor_sched/ta_uclamp_min",
      "Values": [
        "553",
        "1",
        "246",
        "185",
        "123",
        "62"
      ],
      "DefaultIndex": 1,
      "ResetOnInit": true
    },
```
这个文件将 `ta_uclamp_min` 重命名为 `TAUClampBoost`，然后根据 不同场景来设置不同 的val。

```
    {
      "PowerHint": "LAUNCH",
      "Node": "TAUClampBoost",
      "Duration": 5000,
      "Value": "553"
    },

    {
      "PowerHint": "REFRESH_120FPS",
      "Node": "TAUClampBoost",
      "Duration": 0,
      "Value": "185"
    },
    {
      "PowerHint": "REFRESH_90FPS",
      "Node": "TAUClampBoost",
      "Duration": 0,
      "Value": "123"
    },
    {
      "PowerHint": "REFRESH_60FPS",
      "Node": "TAUClampBoost",
      "Duration": 0,
      "Value": "62"
    },
    {
      "PowerHint": "ADPF_DISABLE_TA_BOOST",
      "Node": "TAUClampBoost",
      "Duration": 0,
      "Value": "1"
    },
    {
      "PowerHint": "DISABLE_TA_BOOST",
      "Node": "TAUClampBoost",
      "Duration": 0,
      "Value": "1"
    },
```

boost 场景与 ta_uclamp_min 关系
```
boost 场景	boost val
LAUCH		553
120 FPS		185
90 FPS		123
60FPS		62
```

cpu0-7 capacity
```
cpu	capacity
cpu0-3	124
cpu4-5	427
cpu6-7	1024
```

游戏场景，由于游戏等前台应用对响应时间较为敏感，pixel6 上android的框架层直接将 `ta_uclamp_min` 设置为 185或者更多，这样游戏进程主线程或者其他前台进程主线程就无法跑在小核心上，至少是大核起步

```
raven:/sys/kernel/vendor_sched # cat ta_uclamp_min
185
raven:/sys/kernel/vendor_sched #
```

