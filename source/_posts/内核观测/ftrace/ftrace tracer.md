---
title: ftrace tracer
date: 2020-09-19 10:00:40
tags:
    - irq
    - ftrace
categories:
    - linux内核
---

Ftrace是一个内部跟踪器，旨在帮助系统的开发人员和设计人员查找内核内部发生的情况。 它可以用于调试或分析在用户空间之外发生的延迟和性能问题。

尽管通常将ftrace视为函数跟踪器，但实际上它是多个分类跟踪实用程序的框架。 可以进行延迟跟踪，以检查禁用和启用中断之间的情况以及抢占以及从唤醒任务到计划任务的时间。

ftrace的最常见用途之一是事件跟踪。 整个内核中有数百个静态事件点，可以通过tracefs文件系统启用这些事件点，以查看内核某些部分的情况。

## available_tracers
### irqsoff
我们都知道linux执行中断的时候都是关中断的，也不存在什么中断嵌套，中断被禁时CPU无法响应任何其他外部事件（除了NMI和SMI）。
万一某个驱动开发者代码没有注意将临界区设置的比较大，或者中断处理函数中执行了较多内容，就会直接导致调度延迟增大，直接表现为业务抖动较大，我们有没有什么手段观测这个关中断的时间长短呢?答案是肯定的：
```
sh@ubuntu[root]:/sys/kernel/debug/tracing# cat /sys/kernel/debug/tracing/available_tracers
hwlat blk mmiotrace function_graph wakeup_dl wakeup_rt wakeup irqsoff function nop
```
irqsoff 这个 tracer 就是来完成这个使命的

```
sh@ubuntu[root]:~# echo 0 > /sys/kernel/debug/tracing/tracing_on
sh@ubuntu[root]:~# echo irqsoff > /sys/kernel/debug/tracing/current_tracer
sh@ubuntu[root]:~# echo 0 > /sys/kernel/debug/tracing/tracing_max_latency
sh@ubuntu[root]:~# echo 1 > /sys/kernel/debug/tracing/tracing_on
sh@ubuntu[root]:~# sleep 5
sh@ubuntu[root]:~# echo 0 > /sys/kernel/debug/tracing/tracing_on
sh@ubuntu[root]:~# cat /sys/kernel/debug/tracing/trace | head -n 30
# tracer: irqsoff
#
# irqsoff latency trace v1.1.5 on 5.4.44
# --------------------------------------------------------------------
# latency: 769 us, #15/15, CPU#2 | (M:desktop VP:0, KP:0, SP:0 HP:0 #P:4)
#    -----------------
#    | task: kworker/2:0-5528 (uid:0 nice:0 policy:0 rt_prio:0)
#    -----------------
#  => started at: e1000_update_stats
#  => ended at:   e1000_update_stats
#
#
#                  _------=> CPU#
#                 / _-----=> irqs-off
#                | / _----=> need-resched
#                || / _---=> hardirq/softirq
#                ||| / _--=> preempt-depth
#                |||| /     delay
#  cmd     pid   ||||| time  |   caller
#     \   /      |||||  \    |   /
kworker/-5528    2d...    0us!: _raw_spin_lock_irqsave <-e1000_update_stats
kworker/-5528    2d...  609us : e1000_read_phy_reg <-e1000_update_stats
kworker/-5528    2d...  610us : _raw_spin_lock_irqsave <-e1000_read_phy_reg
kworker/-5528    2d...  620us : __const_udelay <-e1000_read_phy_reg
kworker/-5528    2d...  620us+: delay_tsc <-__const_udelay
kworker/-5528    2d...  678us : _raw_spin_unlock_irqrestore <-e1000_read_phy_reg
kworker/-5528    2d...  679us : e1000_read_phy_reg <-e1000_update_stats
kworker/-5528    2d...  679us : _raw_spin_lock_irqsave <-e1000_read_phy_reg
kworker/-5528    2d...  687us : __const_udelay <-e1000_read_phy_reg
kworker/-5528    2d...  688us+: delay_tsc <-__const_udelay
kworker/-5528    2d...  770us : tracer_hardirqs_on <-e1000_update_stats
kworker/-5528    2d...  774us : <stack trace>
 => e1000_update_stats
 => e1000_watchdog
 => process_one_work
 => worker_thread
 => kthread
 => ret_from_fork
sh@ubuntu[root]:~# cat /sys/kernel/debug/tracing/tracing_max_latency
769
```
可以看到 `tracing_max_latency` 是 769，意味着系统最长关中断时间就是 769us.
(要重置最大值，需要将0回显到tracing_max_latency中)

这是未设置函数跟踪的结果 可以 `echo 1 > /sys/kernel/debug/tracing/options/function-trace` 获取更详细输出

### preemptoff
禁用抢占功能后，我们可能会收到中断，但无法抢占该任务，优先级较高的任务必须等待再次启用抢占功能，才能抢占优先级较低的任务。

preemptoff跟踪程序将跟踪禁用抢占的位置。 与irqsoff跟踪器一样，它记录禁用了抢占的最大延迟。 preemptoff跟踪器的控制与irqsoff跟踪器非常相似。

```
# echo preemptoff > current_tracer
# echo 1 > tracing_on
# echo 0 > tracing_max_latency
# ls -ltr
[...]
# echo 0 > tracing_on
# cat trace
# tracer: preemptoff
#
# preemptoff latency trace v1.1.5 on 3.8.0-test+
# --------------------------------------------------------------------
# latency: 46 us, #4/4, CPU#1 | (M:preempt VP:0, KP:0, SP:0 HP:0 #P:4)
#    -----------------
#    | task: sshd-1991 (uid:0 nice:0 policy:0 rt_prio:0)
#    -----------------
#  => started at: do_IRQ
#  => ended at:   do_IRQ
#
#
#                  _------=> CPU#
#                 / _-----=> irqs-off
#                | / _----=> need-resched
#                || / _---=> hardirq/softirq
#                ||| / _--=> preempt-depth
#                |||| /     delay
#  cmd     pid   ||||| time  |   caller
#     \   /      |||||  \    |   /
    sshd-1991    1d.h.    0us+: irq_enter <-do_IRQ
    sshd-1991    1d..1   46us : irq_exit <-do_IRQ
    sshd-1991    1d..1   47us+: trace_preempt_on <-do_IRQ
    sshd-1991    1d..1   52us : <stack trace>
 => sub_preempt_count
 => irq_exit
 => do_IRQ
 => ret_from_intr
```

### preemptirqsoff
preemptirqsoff 是以上两者的和，会显示禁止 抢占或者中断的最长时间
比如
```
local_irq_disable();
call_function_with_irqs_off();
preempt_disable();
call_function_with_irqs_and_preemption_off();
local_irq_enable();
call_function_with_preemption_off();
preempt_enable();
```

### wakeup、wakeup_rt
wakeup、wakeup_rt 是 trace一个进程从进入CPU的就绪队列到真正被执行的时间的一个tracer，即跟踪调度器的延迟。



##






参考[ftrace 内核文档](https://www.kernel.org/doc/html/v4.18/trace/ftrace.html#irqsoff)