---
title: interrupt storm
date: 2021-03-01 19:00:40
tags:
    - intrrrupt
    - intrrrupt storm
categories:
    - linux内核
---



记录一下`hrtimer`使用问题导致的 `interrupt storm` （中断风暴）。
## hrtimer使用
1. 只想使用一次
```
init -> start -> [return HRTIMER_NORESTART;]
```

2. 想使用多次，timer 一直存在
```
init -> start -> [hrtimer_forward_now; return HRTIMER_NORESTART;]
```



参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/misc/hrtimer/hrtimer.c)

init:
```
	hrtimer_init( &hr_timer, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
	hr_timer.function = &my_hrtimer_callback;
```

start:
```
	hrtimer_start(&hr_timer, ms_to_ktime(500), HRTIMER_MODE_REL);
```

callback: (产生中断风暴)
```
int once_timer = 1;
int interrupt_storm = 0;

enum hrtimer_restart my_hrtimer_callback( struct hrtimer *hr_timer)
{
	printk("my_hrtimer_callback called (%ld).\n", jiffies );

	if (interrupt_storm) {
		if (once_timer) {
			return HRTIMER_NORESTART;
		}
		hrtimer_forward_now(hr_timer, ms_to_ktime(500));
	}

	return HRTIMER_RESTART;
}
```


## 中断风暴

安装这个模块
```
stable_kernel@kernel: /tmp/share/test_modules/misc/hrtimer# sudo insmod hrtimer.ko
```

产生如下警告：
```
[ 1130.893739] rcu: INFO: rcu_sched detected stalls on CPUs/tasks:
[ 1130.893750] rcu: 	3-...0: (5 GPs behind) idle=b3e/0/0x1 softirq=17149/17149 fqs=6500
[ 1208.887926] rcu: INFO: rcu_sched detected stalls on CPUs/tasks:
[ 1208.888716] rcu: 	3-...0: (5 GPs behind) idle=b3e/0/0x1 softirq=17149/17149 fqs=24703

rlk-Standard-PC-i440FX-PIIX-1996 login:
rlk-Standard-PC-i440FX-PIIX-1996 login: [ 1286.883226] rcu: INFO: rcu_sched detected stalls on CPUs/tasks:
[ 1286.884781] rcu: 	3-...0: (5 GPs behind) idle=b3e/0/0x1 softirq=17149/17149 fqs=42700
```


然后`crash`,看现场信息
```

```






























