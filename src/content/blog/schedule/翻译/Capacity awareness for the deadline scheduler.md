---
title: Capacity awareness for the deadline scheduler
date: 2021-04-12 19:00:00
tags:
    - schedule
categories:
    - linux kernel
    - linux schedule
    - deadline schedule
slug: "schedule/翻译/Capacity-awareness-for-the-deadline-scheduler"
---



## What is CPU Capacity?


## What is Capacity awareness
Capacity Awareness refers to the fact that on heterogeneous systems
(like Arm big.LITTLE), the capacity of the CPUs is not uniform, hence
when placing tasks we need to be aware of this difference of CPU
capacities.
容量意识是指在异构系统上（例如Arm big.LITTLE），CPU的容量不一致，因此
在放置任务时，我们需要意识到CPU的这种差异能力。

## RT scheduler 遇到的问题
参考[sched/rt: Make RT capacity-aware](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=804d402fb6f6)

在ARM big.LITTLE情况下，我们要确保所选的CPU有足够的Capacity，满足运行任务运行的要求，可以理解为：

```
capacity_orig_of（cpu）> = task.requirement。
```
1. 对于CFS来说：
```
capacity_orig_of(cpu) >= cfs_task.util
```

2. 对于 deadline来说：(虽然还没有这个机制，但是可以使用bandwidth
reservation实现)
```
capacity_orig_of(cpu)/SCHED_CAPACITY >= dl_deadline/dl_runtime
```

3. 对于RT，我们没有跟踪Per-task的CPU利用率，并且我们没有任何需求 去跟踪 RT-task对性能的要求。 但是随着uclamp的引入，RT任务现在可以控制通过设置uclamp_min来保证最低性能点。











## Deadline scheduler 遇到的问题
参考[LWN文章](https://lwn.net/Articles/821578/)
linux deadline scheduler 将cpu分配给deadline 调度类的task，确保每个task不会逾期，这在SMP系统上很容易办到，但是在arm的 big.LITTLE系统中这变得很复杂，因为一个task假设在big core上需要运行50ms，在LITTLE core上可能需要运行100ms。在scheduler 不能感知到这些 big.LITTLE core的算力差异的时候，deadline的选核操作就有很大问题，会导致一些task被调度到小核上去，task由于小核算力不足导致最后逾期。

deadline schedule中缺少的信息是对CPU容量（CPU Capacity）的了解-在给定时间内可以执行的指令数。CPU capacity已经在 load balancing和其他场景中使用了。

For example:
```
1. [Telling the scheduler about thermal pressure](https://lwn.net/Articles/788380/)

2. [CPU capacity Usage in rt scheduler](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=804d402fb6f6)
```

Eggemann's的工作主要是让 task placement 算法 考虑了不通CPU的 Capacity的差异，加上他的patch之后，deadline scheduler不管是选择到了big core还是 LITTLE core，都会满足 task的算力要求。



## 具体改了啥？

admission-control 主要是基于系统中CPU总算力决定的。
1. 在SMP系统中，单个CPU 容量是c, 系统中有x个cpu，系统总算力C = x * c。
2. AMP系统中，x个big core，单个容量是c1，y个LITTLE core，单个容量是c2，系统总算力C = x * c1 + y * c2。

deadline scheduler的task-placement 还必须更好地了解系统的CPU拓扑。 在将任务移至新CPU之前，调度程序需要确保新CPU可以处理该任务。 在AMP中，需要有新的方法检查从一个cpu a迁移出的task到 cpu b，b的CPU Capacity满足task的要求，使用以下公式执行 fitness check：
```
(CPU capacity) / 1024 >= (task runtime) / (task deadline)
                    |

cap            >> 10  >= (p->dl.dl_runtime) / (p->dl.dl_deadline)
                    |

(cap >> 10) * p->dl.dl_deadline  >=  p->dl.dl_runtime
                    |

(cap * p->dl.dl_deadline)  >> 10  >=  p->dl.dl_runtime
                    |

cap_scale(p->dl.dl_deadline, cap) >= p->dl.dl_runtime;
```

对应`kernel/sched/sched.h`
```
#define cap_scale(v, s) ((v)*(s) >> SCHED_CAPACITY_SHIFT)

static inline bool dl_task_fits_capacity(struct task_struct *p, int cpu)
{
	unsigned long cap = arch_scale_cpu_capacity(cpu);

	return cap_scale(p->dl.dl_deadline, cap) >= p->dl.dl_runtime;
}
```

## 这个改动会影响啥
1. waking up a deadline task
2. moving a deadline task to a different CPU
3. migrating a task out of a CPU that is going offline

都会检查 target cpu的 Capacity 是否满足task 的deadline条件。










