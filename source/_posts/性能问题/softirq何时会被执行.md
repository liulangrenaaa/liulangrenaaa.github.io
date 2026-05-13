---
title: softirq何时会被执行
date: 2020-09-20 19:00:00
tags:
    - 内核同步
    - 软中断
    - tasklet
    - ksoftirqd
categories:
    - linux内核
---

很多人可能都知道中断irq，但是对软中断softfirq却比较陌生，软中断这个概念是纯软件意义上的，与中断依赖于硬件行为不一样。在linux中，软中断主要用于执行irq中没有执行，但又不是很紧急的事情，现在linux内核中为每个CPU都分配了一个线程 `[ksoftirqd/n]`，用来执行软中断。
```
sh@ubuntu[root]:/sys/kernel/debug/tracing# ps -aux |grep soft
root          10  0.0  0.0      0     0 ?        S    9月19   0:19 [ksoftirqd/0]
root          18  0.0  0.0      0     0 ?        S    9月19   0:17 [ksoftirqd/1]
root          24  0.0  0.0      0     0 ?        S    9月19   0:18 [ksoftirqd/2]
root          30  0.0  0.0      0     0 ?        S    9月19   0:21 [ksoftirqd/3]
```

具体软中断分以下几种
```
enum{
	HI_SOFTIRQ=0,
	TIMER_SOFTIRQ,
	NET_TX_SOFTIRQ,
	NET_RX_SOFTIRQ,
	BLOCK_SOFTIRQ,
	IRQ_POLL_SOFTIRQ,
	TASKLET_SOFTIRQ,
	SCHED_SOFTIRQ,
	HRTIMER_SOFTIRQ, /* Unused, but kept as tools rely on the numbering. Sigh! */
	RCU_SOFTIRQ,    /* Preferable RCU should always be the last softirq */
	NR_SOFTIRQS
};
```

通过 `open_softirq` 初始化
```
static struct softirq_action softirq_vec[NR_SOFTIRQS] __cacheline_aligned_in_smp;


void open_softirq(int nr, void (*action)(struct softirq_action *))
{
	softirq_vec[nr].action = action;
}
```

触发软中断的时候通过 `raise_softirq` 来触发
```
void raise_softirq(unsigned int nr)
{
	unsigned long flags;

	local_irq_save(flags);
	raise_softirq_irqoff(nr);
	local_irq_restore(flags);
}
```

但tasklet机制直接使用了 `raise_softirq_irqoff`，搜索代码可以发现其他类型的softirq也基本都是用 `raise_softirq_irqoff` 触发。

```
static void __tasklet_schedule_common(struct tasklet_struct *t,
				      struct tasklet_head __percpu *headp,
				      unsigned int softirq_nr)
{
	struct tasklet_head *head;
	unsigned long flags;

	local_irq_save(flags);
	head = this_cpu_ptr(headp);
	t->next = NULL;
	*head->tail = t;
	head->tail = &(t->next);
	raise_softirq_irqoff(softirq_nr);
	local_irq_restore(flags);
}
```

来看下 `raise_softirq_irqoff` 实现，
```
#define local_softirq_pending_ref irq_stat.__softirq_pending
#define or_softirq_pending(x)	(__this_cpu_or(local_softirq_pending_ref, (x)))

void __raise_softirq_irqoff(unsigned int nr)
{
	trace_softirq_raise(nr);       // 软中断 raise 的 tracepoint 点
	or_softirq_pending(1UL << nr); // 设置当前cpu的软中断pending状态
}

inline void raise_softirq_irqoff(unsigned int nr)
{
	__raise_softirq_irqoff(nr);
	if (!in_interrupt())
		wakeup_softirqd(); //如果不是中断上下文，就需要唤醒 ksoftirqd来执行相关软中断，这也保证了在线程上下文中软中断可以得到较快执行
}
```

__raise_softirq_irqoff 仅仅是设置 __softirq_pending 标志位，这有两个作用
1. 如果当前是中断irq上下文，在 irq_exit 之后，检查 local_softirq_pending，判断有软中断需要执行
2. 如果当前是线程上下文，在 ksoftirq 线程中检查标志位，最后执行相关的软中断
3. 如果当前在临界区上，在打开中断时，可以检测pending的软中断如何去执行


irq_exit的情况
```
static inline void invoke_softirq(void)
{ //不考虑软中断强制线程化，简化代码
	if (ksoftirqd_running(local_softirq_pending()))
		return;
   __do_softirq();
}

void irq_exit(void)
{
#ifndef __ARCH_IRQ_EXIT_IRQS_DISABLED
	local_irq_disable();
#else
	lockdep_assert_irqs_disabled();
#endif
	account_irq_exit_time(current);
	preempt_count_sub(HARDIRQ_OFFSET);
	if (!in_interrupt() && local_softirq_pending())
		invoke_softirq();   //在中断退出之后，如果有 pending的软中断，就需要执行 软中断

	tick_irq_exit();
	rcu_irq_exit();
	trace_hardirq_exit(); /* must be last! */
}
```

ksoftirq线程
```
static void run_ksoftirqd(unsigned int cpu)
{
	local_irq_disable();
	if (local_softirq_pending()) {
		/*
		 * We can safely run softirq on inline stack, as we are not deep
		 * in the task stack here.
		 */
		__do_softirq();
		local_irq_enable();
		cond_resched();
		return;
	}
	local_irq_enable();
}
```

开启中断的情况下
```
void __local_bh_enable_ip(unsigned long ip, unsigned int cnt)
{
	WARN_ON_ONCE(in_irq());
	lockdep_assert_irqs_enabled();
	preempt_count_sub(cnt - 1);
	if (unlikely(!in_interrupt() && local_softirq_pending())) {
        // 如果不在中断中，且 softirq 有pending的位，就需要执行软中断
		do_softirq();
	}
	preempt_count_dec();
	preempt_check_resched();
}
EXPORT_SYMBOL(__local_bh_enable_ip);

static inline void local_bh_enable(void)
{
	__local_bh_enable_ip(_THIS_IP_, SOFTIRQ_DISABLE_OFFSET);
}
```
## __do_softirq
不管是退出中断时执行软中断，还是在ksoftirqd中執行软中断，最终都会执行到 `__do_softirq` 这个函数

```
#define MAX_SOFTIRQ_TIME  msecs_to_jiffies(2)       //2ms
#define MAX_SOFTIRQ_RESTART 10

asmlinkage __visible void __softirq_entry __do_softirq(void)
{
	unsigned long end = jiffies + MAX_SOFTIRQ_TIME;
	unsigned long old_flags = current->flags;
	int max_restart = MAX_SOFTIRQ_RESTART;
	struct softirq_action *h;
	bool in_hardirq;
	__u32 pending;
	int softirq_bit;

	/*
	 * Mask out PF_MEMALLOC as the current task context is borrowed for the
	 * softirq. A softirq handled, such as network RX, might set PF_MEMALLOC
	 * again if the socket is related to swapping.
	 */
	current->flags &= ~PF_MEMALLOC;

	pending = local_softirq_pending();
	account_irq_enter_time(current);

	__local_bh_disable_ip(_RET_IP_, SOFTIRQ_OFFSET);
	in_hardirq = lockdep_softirq_start();

restart:
	/* Reset the pending bitmask before enabling irqs */
	set_softirq_pending(0);

	local_irq_enable();

	h = softirq_vec;

	while ((softirq_bit = ffs(pending))) { //循环执行 pending的软中断
		unsigned int vec_nr;
		int prev_count;

		h += softirq_bit - 1;

		vec_nr = h - softirq_vec;
		prev_count = preempt_count();

		kstat_incr_softirqs_this_cpu(vec_nr);

		trace_softirq_entry(vec_nr);  //trace 软中断执行
		h->action(h);
		trace_softirq_exit(vec_nr);   //trace 软中断退出
		if (unlikely(prev_count != preempt_count())) {
			pr_err("huh, entered softirq %u %s %p with preempt_count %08x, exited with %08x?\n",
			       vec_nr, softirq_to_name[vec_nr], h->action,
			       prev_count, preempt_count());
			preempt_count_set(prev_count);
		}
		h++;
		pending >>= softirq_bit;
	}

	if (__this_cpu_read(ksoftirqd) == current)
		rcu_softirq_qs();
	local_irq_disable();

	pending = local_softirq_pending();
	if (pending) {
		if (time_before(jiffies, end) && !need_resched() &&
		    --max_restart) //如果又有pending的软中断了，看看是否执行超时了 2ms，且 restart 不能超过10次
			goto restart; //未超时

		wakeup_softirqd(); //超时 2ms，唤醒softirqd去执行软中断
	}

	lockdep_softirq_end(in_hardirq);
	account_irq_exit_time(current);
	__local_bh_enable(SOFTIRQ_OFFSET);
	WARN_ON_ONCE(in_interrupt());
	current_restore_flags(old_flags, PF_MEMALLOC);
}
```

## do_softirq
`do_softirq` 和 其他代码路径下执行软中断不一样，最终执行代码的是 `do_softirq_own_stack`，后续分析 -=-！
```
void do_softirq_own_stack(void)
{
	struct irq_stack *irqstk;
	u32 *isp, *prev_esp;

	irqstk = __this_cpu_read(softirq_stack_ptr);

	/* build the stack frame on the softirq stack */
	isp = (u32 *) ((char *)irqstk + sizeof(*irqstk));

	/* Push the previous esp onto the stack */
	prev_esp = (u32 *)irqstk;
	*prev_esp = current_stack_pointer;

	call_on_stack(__do_softirq, isp);
}

asmlinkage __visible void do_softirq(void)
{
	unsigned long flags;
	local_irq_save(flags);
	if (local_softirq_pending() && !ksoftirqd_running(pending))
		do_softirq_own_stack();
	local_irq_restore(flags);
}
```

## 如何观察softirq
在softirq处理过程中（非ksoftirqd线程），在该local cpu上的其他进程是无法进行调度的，不管进程有多高的优先级。因此这点势必对系统实时性造成影响。

1. 通过 `/proc/softirqs` ，配合 `watch` 命令来观察
2. 通过一些tracepoint来观察