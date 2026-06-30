---
title: boost
date: 2021-04-28 19:00:00
tags:
    - QCOM
categories:
    - QCOM
slug: "schedule/Qcom-kernel/boost"
---



## WHAT?

Scheduler boost 是一个机制：将task放到capacity比自己需求大很多 cpu上的机制，
开启 `boost` 的entity也需要为他结束负责。

boost机制 主要是给上层 or framework层写文件节点的，改变`boost机制`，是`整个系统生效的`，并不是针对于某单个thread。
```
Scheduler boost is a mechanism to temporarily place tasks on CPUs
with higher capacity than those where a task would have normally
ended up with their load characteristics. Any entity enabling
boost is responsible for disabling it as well.
```


## WHY?


## boost 基本概念

boost type 分为以下几种
```
#define NO_BOOST 0
#define FULL_THROTTLE_BOOST 1
#define CONSERVATIVE_BOOST 2
#define RESTRAINED_BOOST 3
#define FULL_THROTTLE_BOOST_DISABLE -1
#define CONSERVATIVE_BOOST_DISABLE -2
#define RESTRAINED_BOOST_DISABLE -3
#define MAX_NUM_BOOST_TYPE (RESTRAINED_BOOST+1)
```

可以通过`sched_boost()`获得
```
extern unsigned int sched_boost_type;
static inline int sched_boost(void)
{
	return sched_boost_type;
}
```


boost policy 分为以下几种
```
enum sched_boost_policy {
	SCHED_BOOST_NONE,
	SCHED_BOOST_ON_BIG,
	SCHED_BOOST_ON_ALL,
};
```
可以通过`sched_boost_policy()`获得
```
extern enum sched_boost_policy boost_policy;
static inline enum sched_boost_policy sched_boost_policy(void)
{
	return boost_policy;
}
```



每个boost type有相关的`enter`，`exit`方法，
```
struct sched_boost_data {
	int refcount;
	void (*enter)(void);
	void (*exit)(void);
};

static struct sched_boost_data sched_boosts[] = {
	[NO_BOOST] = {
		.refcount = 0,
		.enter = sched_no_boost_nop,
		.exit = sched_no_boost_nop,
	},
	[FULL_THROTTLE_BOOST] = {
		.refcount = 0,
		.enter = sched_full_throttle_boost_enter,
		.exit = sched_full_throttle_boost_exit,
	},
	[CONSERVATIVE_BOOST] = {
		.refcount = 0,
		.enter = sched_conservative_boost_enter,
		.exit = sched_conservative_boost_exit,
	},
	[RESTRAINED_BOOST] = {
		.refcount = 0,
		.enter = sched_restrained_boost_enter,
		.exit = sched_restrained_boost_exit,
	},
};
```



## api
写`/proc` 文件节点 最后调用到`sched_boost_handler()`-->`_sched_set_boost()`。

```
static void _sched_set_boost(int type)
{
	if (type == 0)
		sched_boost_disable_all();
	else if (type > 0)
		sched_boost_enable(type);
	else
		sched_boost_disable(-type);

	sched_boost_type = sched_effective_boost();
	sysctl_sched_boost = sched_boost_type;
	set_boost_policy(sysctl_sched_boost);
}

int sched_boost_handler(struct ctl_table *table, int write,
		void __user *buffer, size_t *lenp,
		loff_t *ppos)
{
	mutex_lock(&boost_mutex);
	_sched_set_boost(*data);
done:
	mutex_unlock(&boost_mutex);
}
```

_sched_set_boost(int type) type可能是以下一种：
```
#define NO_BOOST 0
#define FULL_THROTTLE_BOOST 1
#define CONSERVATIVE_BOOST 2
#define RESTRAINED_BOOST 3
#define FULL_THROTTLE_BOOST_DISABLE -1
#define CONSERVATIVE_BOOST_DISABLE -2
#define RESTRAINED_BOOST_DISABLE -3
```
type == NO_BOOST ==> disable all
type > NO_BOOST ==> enable one boost
type < NO_BOOST ==> disable one boost


sched_boosts 使用了refcount机制，已经开启的boost_type的 `refcount > 0`，如果使能多个`boost type`，则哪个值大，生效哪个，可以重复开启某一个type的 boost，由于有refcount，所以也需要多次disable。


`sched_boost_disable_all()`，直接调用所有`refcount > 0`的 boost type的 `.exit()`方法，然后 `refcount = 0`。
```
static void sched_boost_disable_all(void)
{
	int i;

	for (i = SCHED_BOOST_START; i < SCHED_BOOST_END; i++) {
		if (sched_boosts[i].refcount > 0) {
			sched_boosts[i].exit();
			sched_boosts[i].refcount = 0;
		}
	}
}
```

`sched_boost_enable()` 首先`refcount++`，最终调用到 `.enter()`方法然后实现enable。
```
static void sched_boost_enable(int type)
{
	struct sched_boost_data *sb = &sched_boosts[type];
	int next_boost, prev_boost = sched_boost_type;

	sb->refcount++;

	if (sb->refcount != 1) // 如果已经处于这种模式了，那就直接返回
		return;
	next_boost = sched_effective_boost();
	if (next_boost == prev_boost)
		return;

	sched_boosts[prev_boost].exit();
	sched_boosts[next_boost].enter();
}
```

## boost type实现
针对于每种`boost type`，Q实现了其 `struct sched_boost_data`
```
struct sched_boost_data {
	int refcount;
	void (*enter)(void);
	void (*exit)(void);
};
```


### NO_BOOST
```
static struct sched_boost_data sched_boosts[] = {
	[NO_BOOST] = {
		.refcount = 0,
		.enter = sched_no_boost_nop,
		.exit = sched_no_boost_nop,
	},
};
```

sched_no_boost_nop() 就是 nop空函数

### FULL_THROTTLE_BOOST
```
static struct sched_boost_data sched_boosts[] = {
	[FULL_THROTTLE_BOOST] = {
		.refcount = 0,
		.enter = sched_full_throttle_boost_enter,
		.exit = sched_full_throttle_boost_exit,
	},
};
```

`.enter()` `.exit()`方法
```
static void sched_full_throttle_boost_enter(void)
{
	core_ctl_set_boost(true); // 与 core_ctl强相关，后面再看
	walt_enable_frequency_aggregation(true);
}

static void sched_full_throttle_boost_exit(void)
{
	core_ctl_set_boost(false);
	walt_enable_frequency_aggregation(false);
}
```

### CONSERVATIVE_BOOST
```
static struct sched_boost_data sched_boosts[] = {
	[CONSERVATIVE_BOOST] = {
		.refcount = 0,
		.enter = sched_conservative_boost_enter,
		.exit = sched_conservative_boost_exit,
	},
};
```

`.enter()` `.exit()`方法
```
static void sched_conservative_boost_enter(void)
{
	update_cgroup_boost_settings();
}

static void sched_conservative_boost_exit(void)
{
	restore_cgroup_boost_settings();
}
```

### RESTRAINED_BOOST
```
static struct sched_boost_data sched_boosts[] = {
	[RESTRAINED_BOOST] = {
		.refcount = 0,
		.enter = sched_restrained_boost_enter,
		.exit = sched_restrained_boost_exit,
	},
};
```

`.enter()` `.exit()`方法
```
static void sched_restrained_boost_enter(void)
{
	walt_enable_frequency_aggregation(true);
}

static void sched_restrained_boost_exit(void)
{
	walt_enable_frequency_aggregation(false);
}
```







## 结论
Full throttle： FULL_THROTTLE_BOOST
```
1、通过core control，将所有cpu都进行unisolation
2、通过freq聚合，将load计算放大。从而触发提升freq，或者迁移等
3、通过设置boost policy= SCHED_BOOST_ON_BIG，迁移挑选target cpu时，只会选择大核
最终效果应该尽可能把任务都放在大核运行（除了cpuset中有限制）
```

Conservative： CONSERVATIVE_BOOST
```
1、通过更新group boost配置，仅让top-app和foreground组进行task placement boost
2、提高min_task_util的门限，让进行up migrate的条件更苛刻。只有load较大（>1ms）的task，会进行up migrate。
2、同上，更改min_task_util门限后，会提醒系统task与cpu是misfit，需要进行迁移。
3、通过设置boost policy= SCHED_BOOST_ON_BIG，迁移挑选target cpu时，只会选择大核
最终效果：top-app和foreground的一些task会迁移到大核运行
```

Restrained： RESTRAINED_BOOST
```
1、通过freq聚合，将load计算放大。从而触发提升freq，或者迁移等
load放大后，仍遵循基本EAS。提升freq或者迁移，视情况而定。
```
