---
title: ipi_sched
date: 2021-04-21 19:00:00
tags:
    - schedule
categories:
    - linux kernel
    - linux schedule
---


## WHAT?
IPI 中断 (Inter-Processor Interrupts) ，核间中断可以通过向这个寄存器写入需要的值来产生。若硬件线程 A 想要发送一个核间中断给硬件线程 B，它只需要向寄存器 IPIBase 中写入 B
的 Thread ID、中断向量、中断类型等值就可以了，PIC 会通知 B 所在的核挂起它当前的执行序列，并根据中断向量跳转到中断服务例程 ISR 的入口


## HOW?

linux上将 IPI 中断分为以下几类
```
enum ipi_msg_type {
	IPI_RESCHEDULE,
	IPI_CALL_FUNC,
	IPI_CPU_STOP,
	IPI_CPU_CRASH_STOP,
	IPI_TIMER,
	IPI_IRQ_WORK,
	IPI_WAKEUP
};
```


通过接口 `smp_cross_call` 调用，For example:
```
void smp_send_reschedule(int cpu)
{
	smp_cross_call(cpumask_of(cpu), IPI_RESCHEDULE);
}
```


CPUa 给 CPUb 发送一个 `IPI_RESCHEDULE` 信号，然后 CPUb执行相关函数
```
/*
 * Main handler for inter-processor interrupts
 */
void handle_IPI(int ipinr, struct pt_regs *regs)
{
	unsigned int cpu = smp_processor_id();
	struct pt_regs *old_regs = set_irq_regs(regs);

	switch (ipinr) {
	case IPI_RESCHEDULE:
		scheduler_ipi();
		break;

	case IPI_CALL_FUNC:
		irq_enter();
		generic_smp_call_function_interrupt();
		irq_exit();
		break;

        }
        ......
	set_irq_regs(old_regs);
}
```


## scheduler_ipi 主要工作？

```
void scheduler_ipi(void)
{
	/*
	 * Fold TIF_NEED_RESCHED into the preempt_count; anybody setting
	 * TIF_NEED_RESCHED remotely (for the first time) will also send
	 * this IPI.
	 */
	preempt_fold_need_resched();

	if (llist_empty(&this_rq()->wake_list) && !got_nohz_idle_kick())
		return;

	/*
	 * Not all reschedule IPI handlers call irq_enter/irq_exit, since
	 * traditionally all their work was done from the interrupt return
	 * path. Now that we actually do some work, we need to make sure
	 * we do call them.
	 *
	 * Some archs already do call them, luckily irq_enter/exit nest
	 * properly.
	 *
	 * Arguably we should visit all archs and update all handlers,
	 * however a fair share of IPIs are still resched only so this would
	 * somewhat pessimize the simple resched case.
	 */
	irq_enter();
	sched_ttwu_pending();

	/*
	 * Check if someone kicked us for doing the nohz idle load balance.
	 */
	if (unlikely(got_nohz_idle_kick())) {
		this_rq()->idle_balance = 1;
		raise_softirq_irqoff(SCHED_SOFTIRQ);
	}
	irq_exit();
}
```

如果 `llist_empty(&this_rq()->wake_list)` 成立，意味着rq上没有需要wake_up的thread，且同时 `!got_nohz_idle_kick()`也成立的话，就直接返回了，这个 IPI就是无效的。

正常都会继续往下继续走，重点是 `sched_ttwu_pending`
```
void sched_ttwu_pending(void)
{
	struct rq *rq = this_rq();
	struct llist_node *llist = llist_del_all(&rq->wake_list);
	struct task_struct *p, *t;
	struct rq_flags rf;

	if (!llist)
		return;

	rq_lock_irqsave(rq, &rf);
	update_rq_clock(rq);
        // 一次性唤醒所有 `wake_list` 上的task。
	llist_for_each_entry_safe(p, t, llist, wake_entry)
		ttwu_do_activate(rq, p, p->sched_remote_wakeup ? WF_MIGRATED : 0, &rf);

	rq_unlock_irqrestore(rq, &rf);
}
```

然后查看是否需要做 `load_balance`

## 什么情况下会发送 IPI_RESCHEDULE？

1. resched_curr()
如果cpu == smp_processor_id()，(这里分为俩种情况，1. UP架构只有一个CPU 2. SMP架构上恰好resched_curr()的是本cpu)
那仅仅是设置 当前 curr的thread_info的 need_resched标志位。
如果是需要其他cpu执行 resched_curr()，就需要 `smp_send_reschedule(cpu)` 来发送 `IPI_RESCHEDULE`了。
```
/*
 * resched_curr - mark rq's current task 'to be rescheduled now'.
 *
 * On UP this means the setting of the need_resched flag, on SMP it
 * might also involve a cross-CPU call to trigger the scheduler on
 * the target CPU.
 */
void resched_curr(struct rq *rq)
{
	struct task_struct *curr = rq->curr;
	int cpu;

	lockdep_assert_held(&rq->lock);

	if (test_tsk_need_resched(curr))
		return;

	cpu = cpu_of(rq);

	if (cpu == smp_processor_id()) {
		set_tsk_need_resched(curr);
		set_preempt_need_resched();
		return;
	}

	if (set_nr_and_not_polling(curr))
		smp_send_reschedule(cpu);
	else
		trace_sched_wake_idle_without_ipi(cpu);
}
```


2. wake_up_idle_cpu()

在唤醒一个 idle的cpu时，
```
static void wake_up_idle_cpu(int cpu)
{
	struct rq *rq = cpu_rq(cpu);

	if (cpu == smp_processor_id())
		return;

	if (set_nr_and_not_polling(rq->idle))
		smp_send_reschedule(cpu);
	else
		trace_sched_wake_idle_without_ipi(cpu);
}s
```


3. kick_process()

让一个 task立刻进入 kernel mode（without any delay），从而来处理 signal信号。
```
/***
 * kick_process - kick a running thread to enter/exit the kernel
 * @p: the to-be-kicked thread
 *
 * Cause a process which is running on another CPU to enter
 * kernel-mode, without any delay. (to get signals handled.)
 *
 * NOTE: this function doesn't have to take the runqueue lock,
 * because all it wants to ensure is that the remote task enters
 * the kernel. If the IPI races and the task has been migrated
 * to another CPU then no harm is done and the purpose has been
 * achieved as well.
 */
void kick_process(struct task_struct *p)
{
	int cpu;

	preempt_disable();
	cpu = task_cpu(p);
	if ((cpu != smp_processor_id()) && task_curr(p))
		smp_send_reschedule(cpu);
	preempt_enable();
}
EXPORT_SYMBOL_GPL(kick_process);

void signal_wake_up_state(struct task_struct *t, unsigned int state)
{
	set_tsk_thread_flag(t, TIF_SIGPENDING);
	/*
	 * TASK_WAKEKILL also means wake it up in the stopped/traced/killable
	 * case. We don't check t->state here because there is a race with it
	 * executing another processor and just now entering stopped state.
	 * By using wake_up_state, we ensure the process will wake up and
	 * handle its death signal.
	 */
	if (!wake_up_state(t, state | TASK_INTERRUPTIBLE))
		kick_process(t);
}
```


4. ttwu_queue_remote()

try_to_wake_up() 一个thread之后，需要将 这个task入队
a. 如果是 task不是在 `本cpu` 唤醒的，那就需要IPI中断`smp_send_reschedule`来搞了
b. 如果是在 `本地cpu` 唤醒的，就直接 lock_rq() 之后进行 `ttwu_do_activate`

```
static void ttwu_queue_remote(struct task_struct *p, int cpu, int wake_flags)
{
	struct rq *rq = cpu_rq(cpu);

	p->sched_remote_wakeup = !!(wake_flags & WF_MIGRATED);

	if (llist_add(&p->wake_entry, &cpu_rq(cpu)->wake_list)) {
		if (!set_nr_if_polling(rq->idle))
			smp_send_reschedule(cpu);
		else
			trace_sched_wake_idle_without_ipi(cpu);
	}
}

static void ttwu_queue(struct task_struct *p, int cpu, int wake_flags)
{
	struct rq *rq = cpu_rq(cpu);
	struct rq_flags rf;

#if defined(CONFIG_SMP)
	if (sched_feat(TTWU_QUEUE) && !cpus_share_cache(smp_processor_id(), cpu)) {
		sched_clock_cpu(cpu); /* Sync clocks across CPUs */
		ttwu_queue_remote(p, cpu, wake_flags);
		return;
	}
#endif

	rq_lock(rq, &rf);
	update_rq_clock(rq);
	ttwu_do_activate(rq, p, wake_flags, &rf);
	rq_unlock(rq, &rf);
}
```

5. wake_up_if_idle()
`wake_up_if_idle()` 只有在 `wake_up_all_idle_cpus()` 中被调用，主要是看此 cpu 是否idle空闲，就是看他 `is_idle_task(cpu_rq(cpu)->curr)` 是否成立，成立的话就需要 IPI中断去唤醒。

```
void wake_up_if_idle(int cpu)
{
	struct rq *rq = cpu_rq(cpu);
	struct rq_flags rf;

	rcu_read_lock();

	if (!is_idle_task(rcu_dereference(rq->curr)))
		goto out;

	if (set_nr_if_polling(rq->idle)) {
		trace_sched_wake_idle_without_ipi(cpu);
	} else {
		rq_lock_irqsave(rq, &rf);
		if (is_idle_task(rq->curr))
			smp_send_reschedule(cpu);
		/* Else CPU is not idle, do nothing here: */
		rq_unlock_irqrestore(rq, &rf);
	}

out:
	rcu_read_unlock();
}

void wake_up_all_idle_cpus(void)
{
	int cpu;

	preempt_disable();
	for_each_online_cpu(cpu) {
		if (cpu == smp_processor_id())
			continue;

		wake_up_if_idle(cpu);
	}
	preempt_enable();
}
```



參考linux-5.4.61代码