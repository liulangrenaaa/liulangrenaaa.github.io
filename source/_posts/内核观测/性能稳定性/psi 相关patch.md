---
title: psi 相关patch
date: 2021-02-08 19:00:40
tags:
    - psi
    - pressure
categories:
    - linux内核
---



## PSI简介

psi 是 `pressure stall information`缩写，主要是观测 系统压力的一系列指标

下面是 Kernel Documention 翻译：
当系统CPU，内存或IO设备有竞争风险时，workload会遇到较大的`sched latency`，吞吐量减少，并有导致OOM被杀死的风险。
如果没有这种到底是哪种资源竞争的度量，在发生资源紧张 或者 性能问题的时候很难确定到底是那种资源
导致的问题（毕竟 内存问题可能导致CPU占满，也会导致IO读取慢等问题），很难找出木桶中最短的那块木板。

psi功能可以识别并量化由 木桶中最短缺的资源 造成的中断及其对复杂工作负载乃至整个系统的时间影响。
准确衡量由资源短缺导致的生产力损失，可以帮助用户将工作负载调整为硬件大小，或者根据工作负载需求配
置硬件。

当psi实时汇总此信息时，可以使用诸如减载，将作业迁移到其他系统或数据中心之类的技术来动态管理系
统，或者从战略上暂停或杀死低优先级或可重新启动的批处理作业。
这样可以最大化硬件利用率，且不会牺牲工作负载的运行状况 或冒重大破坏（如OOM终止）的风险。


关于用户空间接口，在我ubuntu 服务器上（Linux 5.8）可以看到：
```
amd_server@ubuntu: ~/workspace/tmp# cat /proc/pressure/cpu
some avg10=0.00 avg60=0.00 avg300=0.00 total=2344622763
amd_server@ubuntu: ~/workspace/tmp# cat /proc/pressure/io
some avg10=0.00 avg60=0.00 avg300=0.00 total=454836681
full avg10=0.00 avg60=0.00 avg300=0.00 total=444813857
amd_server@ubuntu: ~/workspace/tmp# cat /proc/pressure/memory
some avg10=0.00 avg60=0.00 avg300=0.00 total=31812811
full avg10=0.00 avg60=0.00 avg300=0.00 total=15845529
amd_server@ubuntu: ~/workspace/tmp#
```

`PSI` 的优点如上所说，可以定位系统中的 `短板资源` 是哪个。
在没有 `PSI` 之前的情况是怎么样的呢？
之前可以使用 `loadavg` 与 `vmpressure` 来衡量一些资源压力的情况：
1. `loadavg`：
主要是衡量 一定时间内 运行队列上的进程数（running + uninterruptible 进程数量）
```
long calc_load_fold_active(struct rq *this_rq, long adjust)
{
	long nr_active, delta = 0;

	nr_active = this_rq->nr_running - adjust;
	nr_active += (long)this_rq->nr_uninterruptible;

	if (nr_active != this_rq->calc_load_active) {
		delta = nr_active - this_rq->calc_load_active;
		this_rq->calc_load_active = nr_active;
	}

	return delta;
}
```


用户空间接口`/proc/loadavg`
```
amd_server@ubuntu: /proc# cat /proc/loadavg
0.22 0.14 0.10 2/1013 752563
amd_server@ubuntu: /proc#
```



2. `vmpressure`
可以告知此时内存压力，但是这个需要配置 `CONFIG_MEMCG`。
后面再写。。
代码主要在 `mm/vmpressure.c`

缺点嘛，很明显：
vmpressure 也有一些缺陷：
结果仅体现内存回收压力，不能反映系统在申请内存上的资源等待时间；
计算周期比较粗；
粗略的几个等级通知，无法精细化管理。

vmpresssure 对外接口主要是
```
static inline void vmpressure(gfp_t gfp, struct mem_cgroup *memcg, bool tree,
			      unsigned long scanned, unsigned long reclaimed);
static inline void vmpressure_prio(gfp_t gfp, struct mem_cgroup *memcg,
				   int prio);
```

查看调用栈
```
bpftrace -e 'kprobe:vmpressure { @[kstack] = count(); }'
bpftrace -e 'kprobe:vmpressure_prio { @[kstack] = count(); }'
```

vmpressure
```
@[
    vmpressure+1
    do_try_to_free_pages+215
    try_to_free_mem_cgroup_pages+254
    try_charge_memcg+421
    charge_memcg+69
    mem_cgroup_swapin_charge_page+89
    __read_swap_cache_async+532
    swap_cluster_readahead+368
    swapin_readahead+66
    do_swap_page+950
    handle_pte_fault+468
    __handle_mm_fault+967
    handle_mm_fault+216
    do_user_addr_fault+453
    exc_page_fault+119
    asm_exc_page_fault+30
]: 4639
```


vmpressure_prio
```
@[
    vmpressure_prio+1
    try_to_free_mem_cgroup_pages+254
    try_charge_memcg+421
    charge_memcg+69
    mem_cgroup_swapin_charge_page+89
    __read_swap_cache_async+532
    swap_cluster_readahead+368
    swapin_readahead+66
    do_swap_page+950
    handle_pte_fault+468
    __handle_mm_fault+967
    handle_mm_fault+216
    do_user_addr_fault+453
    exc_page_fault+119
    asm_exc_page_fault+30
]: 19831
```


## PSI实现

```
+--------------------------------------------------------------+
|                                                              |
|                   LKMD OOMD等 应用层模块                       |
|                                                              |
+-----------+------------------------------------+-------------+
            |                                    |
            v                                    v
       System 接口                            Per group 接口
            |                                    |
            |                                    |
+-----------+------------------------------------+--------------+
|                                                               |
|      PSI 值 计 算                   PER CPUTASK和 状态时间统计   |
+-----------+------------------------------------+--------------+
     Enqueue| Dequeue                        Fast| path
            |                                    |
     Tick , |  Wakeup                       Slow | Path
            |                                    |
+-----------v--------------+         +-----------v--------------+
|                          |         |                          |
|        SCHEDULE          |         |         MEMORY           |
|                          |         |                          |
+--------------------------+         +--------------------------+
```

对于用户空间，PSI 模块通过文件系统节点向用户空间开放两种形态的接口。一种是系统级别的接口`/proc/pressure/`。另外一种是结合 control group，进行更精细化的分组`后面再写`。

对于内核空间实现，PSI 模块通过在内存管理模块以及调度器模块中插桩，我们可以跟踪每一个任务由于 memory、io 以及 CPU 资源而进入等待状态的信息。例如系统中处于 iowait 状态的 task 数目、由于等待 memory 资源而处于阻塞状态的任务数目。





代码主要在 `kernel/sched/psi.c`，`kernel/sched/Makefile`中
```
obj-$(CONFIG_PSI) += psi.o
```


这是实现为一个 kernel module的：
```
static int __init psi_proc_init(void)
{
	if (psi_enable) {
		proc_mkdir("pressure", NULL);
		proc_create("pressure/io", 0, NULL, &psi_io_proc_ops);
		proc_create("pressure/memory", 0, NULL, &psi_memory_proc_ops);
		proc_create("pressure/cpu", 0, NULL, &psi_cpu_proc_ops);
	}
	return 0;
}
module_init(psi_proc_init);
```


1. 初始化
```
static void psi_avgs_work(struct work_struct *work) {
	mutex_lock(&group->avgs_lock);

	now = sched_clock();
	collect_percpu_times(group, PSI_AVGS, &changed_states);
	nonidle = changed_states & (1 << PSI_NONIDLE);
	/*
	 * If there is task activity, periodically fold the per-cpu
	 * times and feed samples into the running averages. If things
	 * are idle and there is no data to process, stop the clock.
	 * Once restarted, we'll catch up the running averages in one
	 * go - see calc_avgs() and missed_periods.
	 */
	if (now >= group->avg_next_update)
		group->avg_next_update = update_averages(group, now);
	if (nonidle) {
		schedule_delayed_work(dwork, nsecs_to_jiffies(
				group->avg_next_update - now) + 1);
	}
	mutex_unlock(&group->avgs_lock);
}

static void group_init(struct psi_group *group)
{
	int cpu;

	for_each_possible_cpu(cpu)
		seqcount_init(&per_cpu_ptr(group->pcpu, cpu)->seq);
	group->avg_last_update = sched_clock();
	group->avg_next_update = group->avg_last_update + psi_period;
	INIT_DELAYED_WORK(&group->avgs_work, psi_avgs_work);
	mutex_init(&group->avgs_lock);
        ......
}

void __init psi_init(void) {
	psi_period = jiffies_to_nsecs(PSI_FREQ);
	group_init(&psi_system);
}

void __init sched_init(void) {
	psi_init();
        ......
	scheduler_running = 1;
}
```

初始化分为俩部分:
a. 模块初始化
b. 还有部分是跟随 schedule_init的初始化

如果支持 cgroup（需要 mount cgroup2 文件系统），那么系统中会有多个 PSI group，形成层级结构。



2. 事件触发 统计
其实就是在各个事件发生的时候，在代码路径中埋点。
整个 PSI 技术的核心难点其实在于如何准确捕捉到任务状态的变化，并统计状态持续时间。
状态的标记主要通过函数 `psi_task_change()`，相关的`flag`保存在 `task_struct->flag` 中。
如
```
/* Task state bitmasks */
#define TSK_IOWAIT	(1 << NR_IOWAIT)
#define TSK_MEMSTALL	(1 << NR_MEMSTALL)
#define TSK_RUNNING	(1 << NR_RUNNING)
#define TSK_ONCPU	(1 << NR_ONCPU)
```

在 `enqueue_task()` `dequeue_task()` 中都会调用到 `psi` hook的函数，最后调用到 `psi_task_change()`，

















3. 周期性统计
周期性统计任务是在 `group_init()` 中 开启的，

```
static void calc_avgs(unsigned long avg[3], int missed_periods,
		      u64 time, u64 period)
{
	unsigned long pct;

	/* Fill in zeroes for periods of no activity */
	if (missed_periods) {
		avg[0] = calc_load_n(avg[0], EXP_10s, 0, missed_periods);
		avg[1] = calc_load_n(avg[1], EXP_60s, 0, missed_periods);
		avg[2] = calc_load_n(avg[2], EXP_300s, 0, missed_periods);
	}

	/* Sample the most recent active period */
	pct = div_u64(time * 100, period);
	pct *= FIXED_1;
	avg[0] = calc_load(avg[0], EXP_10s, pct);
	avg[1] = calc_load(avg[1], EXP_60s, pct);
	avg[2] = calc_load(avg[2], EXP_300s, pct);
}

static u64 update_averages(struct psi_group *group, u64 now)
{
	expires = group->avg_next_update;
	if (now - expires >= psi_period)
		missed_periods = div_u64(now - expires, psi_period);

	avg_next_update = expires + ((1 + missed_periods) * psi_period);
	period = now - (group->avg_last_update + (missed_periods * psi_period));
	group->avg_last_update = now;

	for (s = 0; s < NR_PSI_STATES - 1; s++) {
		u32 sample;

		sample = group->total[PSI_AVGS][s] - group->avg_total[s];
		if (sample > period)
			sample = period;
		group->avg_total[s] += sample;
		calc_avgs(group->avg[s], missed_periods, sample, period);
	}

	return avg_next_update;
}

static void psi_avgs_work(struct work_struct *work) {
	mutex_lock(&group->avgs_lock);

	now = sched_clock();
	collect_percpu_times(group, PSI_AVGS, &changed_states);
	nonidle = changed_states & (1 << PSI_NONIDLE);
	/*
	 * If there is task activity, periodically fold the per-cpu
	 * times and feed samples into the running averages. If things
	 * are idle and there is no data to process, stop the clock.
	 * Once restarted, we'll catch up the running averages in one
	 * go - see calc_avgs() and missed_periods.
	 */
	if (now >= group->avg_next_update)
		group->avg_next_update = update_averages(group, now);
	if (nonidle) {
		schedule_delayed_work(dwork, nsecs_to_jiffies(
				group->avg_next_update - now) + 1);
	}
	mutex_unlock(&group->avgs_lock);
}

static void group_init(struct psi_group *group)
{
        ......
	INIT_DELAYED_WORK(&group->avgs_work, psi_avgs_work);
}
```

运行时机是 `psi_period = jiffies_to_nsecs(PSI_FREQ);` 每2s。

从底层看，一个 psi group 的 PSI 值是基于任务数目统计的，当一个任务状态发生变化的时候，首先需要遍历该任务所属的 PSI group（如果不支持 cgroup，那么系统只有一个全局的 PSI group），更新 PSI group 的 task counter。

一旦 task counter 发生了变化，那么我们需要进一步更新对应 CPU 上的时间统计信息。例如 iowait task count 从 0 变成 1，那么 SOME 维度的 io wait time 需要更新。具体的 per-CPU PSI 状态时间统计信息如下：



## 具体分析

可以根据如下 标志 来跟踪内核中的埋点
```
/* Task state bitmasks */
#define TSK_IOWAIT	(1 << NR_IOWAIT)
#define TSK_MEMSTALL	(1 << NR_MEMSTALL)
#define TSK_RUNNING	(1 << NR_RUNNING)
#define TSK_ONCPU	(1 << NR_ONCPU)
```



各种资源状态
```
/*
 * Pressure states for each resource:
 *
 * SOME: Stalled tasks & working tasks
 * FULL: Stalled tasks & no working tasks
 */
enum psi_states {
	PSI_IO_SOME,
	PSI_IO_FULL,
	PSI_MEM_SOME,
	PSI_MEM_FULL,
	PSI_CPU_SOME,
	/* Only per-CPU, to weigh the CPU in the global average: */
	PSI_NONIDLE,
	NR_PSI_STATES = 6,
};
```

memory 相关埋点
```
static void psi_flags_change(struct task_struct *task, int clear, int set);
void psi_task_change(struct task_struct *task, int clear, int set);
void psi_task_switch(struct task_struct *prev, struct task_struct *next,
		     bool sleep);


void psi_memstall_enter(unsigned long *flags);
void psi_memstall_leave(unsigned long *flags);
```


输出到 用户空间
```
static int psi_io_show(struct seq_file *m, void *v)
{
	return psi_show(m, &psi_system, PSI_IO);
}

static int psi_memory_show(struct seq_file *m, void *v)
{
	return psi_show(m, &psi_system, PSI_MEM);
}

static int psi_cpu_show(struct seq_file *m, void *v)
{
	return psi_show(m, &psi_system, PSI_CPU);
}
```
















有了 PSI 对系统资源压力的准确评估，可以做很多有意义的功能来最大化系统资源的利用。比如 facebook 开发的 cgroup2 和 oomd。oomd 是一个用户态的 out of  memory 监控管理服务。

Android 早期在 kernel 新增了一个功能叫 lmk(low memory killer)，在有了 PSI 之后，android 将默认的 LMK 替换成了用户态的 LMKD。其代码存放于 android/system/core/lmkd/。

其核心思想是给 /proc/pressure/memory 的 SOME 和 FULL 设定阈值，当延时超过阈值时，触发 lmkd daemon 进程选择进程杀死。同时，还可以结合 meminfo 的剩余内存大小来判断需要清理的程度和所选进程的优先级。


## 用户态 程序实现
这个程序时在source code的 `Documentation/translations/zh_CN/accounting/psi.rst` 给出的 example。
```
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <poll.h>
#include <string.h>
#include <unistd.h>

/* 监控内存部分阻塞，监控时间窗口为1秒、阻塞门限为150毫秒。*/
int main()
{
        const char trig[] = "some 150000 1000000";
        struct pollfd fds;
        char buf[512];
        ssize_t ret;
        int n;

        fds.fd = open("/proc/pressure/memory", O_RDWR | O_NONBLOCK);
        if (fds.fd < 0)
        {
                printf("/proc/pressure/memory open error: %s\n",
                       strerror(errno));
                return 1;
        }
        fds.events = POLLPRI;

        if (write(fds.fd, trig, strlen(trig) + 1) < 0)
        {
                printf("/proc/pressure/memory write error: %s\n",
                       strerror(errno));
                return 1;
        }

        printf("waiting for events...\n");
        while (1)
        {
                // n = poll(&fds, 1, -1);
                fds.revents |= POLLPRI;
                if (n < 0)
                {
                        printf("poll error: %s\n", strerror(errno));
                        return 1;
                }
                if (fds.revents & POLLERR)
                {
                        printf("got POLLERR, event source is gone\n");
                        return 0;
                }
                if (fds.revents & POLLPRI)
                {
                        printf("event triggered!\n");
                        ret = read(fds.fd, buf, sizeof(buf));
                        if (ret < 0)
                        {
                                printf("poll data error\n");
                        }
                        printf("Memory Pressure Stall Information:\n%s\n", buf);
                }
                else
                {
                        printf("unknown event received: 0x%x\n", fds.revents);
                        return 1;
                }
        }

        return 0;
}
```



参考[文章](https://www.cnblogs.com/Linux-tech/p/12961296.html)