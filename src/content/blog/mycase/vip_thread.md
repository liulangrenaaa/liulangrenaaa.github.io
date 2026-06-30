---
title: vip thread
date: 2022-10-10 19:00:40
tags:
    - sched
    - fair
categories:
    - linux内核
slug: "mycase/vip_thread"
---


## 简介
声明：以下代码均来自于 oplus 开源代码，github地址: https://github.com/OnePlusOSS/android_kernel_modules_and_devicetree_oneplus_sm8450

vip thread就是linux系统中享有vip待遇的线程。把⽤户交互相关的线程（称之为vip线程）作为资源优先分配的对象。⽤户交互相关的线程在整个系统中享受vip待遇。⽬前针对vip_thread，在CPU、memory资源⽅⾯会给予⼀定优先支持。都是针对sched fair线程而言，因为实时线程出身本就是`ssvip`，不需要调度上做资源倾斜。

将线程设置为 vip thread 是剑走偏锋的做法，对runable要求不是非常严格的话，建议尝试
```
1. 提高优先级priority
2. 考虑降低整机负载
3. 优化业务逻辑
```
这些才是正确解决问题的方式。

## 分类
vip thread的优化对象，基本都是cfs线程(偶尔也有rt的线程，主要是为了解决rt线程的锁问题)，因为cfs线程容易出现较多的runnable。对于ux线程，我们可以分为两类。

### static vip thread
静态 vip thread 是指主动被设置为 vip 的 thread，通常是应用启动的时候，hal层将应用的 ui thread 设置为 vip，比如相机 淘宝等应用。

### dynamic vip thread
static vip thread 在运行过程中通常会需要`持锁`来获取某些资源，这会导致 static的 vip thread 因为无法获得锁，而导致vip thread 被block。此场景下，如果持锁的 thread_lock 是一个 优先级较低的 thread，还可能thread_lock owner 在别的cpu上被 block 或者执行时间很长，导致 static 的vip thread 效果有限。

如果 `持锁` 的锁是 `mutex or binder or rwsemaphore` 等，可以通过锁的 owner 成员找到正在持锁的 `thread_lock owner`, 将 `thread_lock owner` 暂时设置为 vip thread(称为 dynamic vip thread)，使得 `thread_lock owner` 尽快执行完，然后取消 dynamic vip thread。


## feature实现

### feature 汇总
```
1. vip thread 获得优先调度的机会
2. SMP架构上 vip thread 需要在不同cpu上进行 load balance
3. vip thread 的 vip 类型 可以通过锁资源在不同 thread之间进行传递，传递深度最大5层
4. dynamic & static vip 的 task 最多维持 vip 类型64ms
```

### 实现原理

#### vip 优先调度
vip thread 在 per_cpu的 `runqueue` 上新增了一个 `vip_thread_list`，在 `task_struct` 中新增一个 `vip_thread_entry`。 task被设置为 vip之后，`run_node`从 `tasks_timeline` 中移除。然后将 `vip_thread_entry` 节点enqueue 到 rq的 `vip_thread_list` 链表末尾，这样在 `vip_thread_list` 中ready的 task就是 按照 enqueue的时间节点来排序的了。

在 pick_next_task 时，大的逻辑还是不会变，从 `stop->dl->rt->cfs` 这种顺序来寻找 下一个运行的 task。在 cfs的 `pick_next_task_fair` 中 会首先去检查 `vip_thread_list` 是否为空，不为空的话就直接取 `vip_thread_list` 的链表首元素 放到 rq 上进行运行。

如果 `vip_thread_list` 为空就说明此 rq 上无 vip_thread。可以进行load_balance，查看其他 rq 的 `vip_thread_list` 是否为空，进行 task_pull。


#### vip task 的 load balance

vip thread 统计per_cpu rq的 high load 情况，在 scheder_tick 到来时，根据 ux的情况来选择是否做 load balance。
```
struct task_count_rq {
	int ux_high;
	int ux_low;
	int top_high;
	int top_low;
	int foreground_high;
	int foreground_low;
	int background_high;
	int background_low;
};
```


#### vip task的 锁传递

假设 `vip_thread_a` 需要获取 `mutex_a`, 此时 `mutex_a` 正在被 `thread_b` 持有，`vip_thread_a` 会

1. 将自己挂到 `mutex_a` 锁的 waiter list中
2. 然后将正在持锁的 `thread_b` 设置为 `vip_thread_b`, 将 mutex的 vip_depth 设置为 1，因为设置了 vip 优先级最多传递 5 层。

step 1:
```
static void mutex_list_add_ux(struct list_head *entry, struct list_head *head)
{
	struct list_head *pos = NULL;
	struct list_head *n = NULL;
	struct mutex_waiter *waiter = NULL;

	list_for_each_safe(pos, n, head) {
		waiter = list_entry(pos, struct mutex_waiter, list);
		if (!test_task_ux(waiter->task)) {   // 不是 ux
			list_add(entry, waiter->list.prev);
			return;
		}
	}

	if (pos == head) {
		list_add_tail(entry, head);
	}
}

bool mutex_list_add(struct task_struct *task, struct list_head *entry, struct list_head *head, struct mutex *lock) {
	bool is_ux = test_task_ux(task);

	if (is_ux) {
		mutex_list_add_ux(entry, head);
		return true;
	}
	return false;
}

/* implement vender hook in kernel/locking/mutex.c */
void android_vh_alter_mutex_list_add_handler(void *unused, struct mutex *lock,
			struct mutex_waiter *waiter, struct list_head *list, bool *already_on_list) {
	if (unlikely(!global_sched_assist_enabled))
		return;

	*already_on_list = mutex_list_add(current, &waiter->list, list, lock);
}
```


step 2:
```
void mutex_set_inherit_ux(struct mutex *lock, struct task_struct *task)
{
	bool is_ux = test_set_inherit_ux(task);
	struct task_struct *owner = __mutex_owner(lock);

	if (is_ux && !test_inherit_ux(owner, INHERIT_UX_MUTEX)) {
		int type = get_ux_state_type(owner);
		if ((UX_STATE_NONE == type) || (UX_STATE_INHERIT == type)) {
			set_inherit_ux(owner, INHERIT_UX_MUTEX, oplus_get_ux_depth(task), oplus_get_ux_state(task)); // 设置 vip 优先级继承
		}
	}
}

void android_vh_mutex_wait_start_handler(void *unused, struct mutex *lock)
{
	if (unlikely(!global_sched_assist_enabled))
		return;

	mutex_set_inherit_ux(lock, current);
}
```

#### dynamic & static vip 的 task 最多维持 vip 类型64ms

为了保证系统稳定，防止 继承了vip 优先级的task 一直在运行。所以如果 继承 vip 优先级的 task 在 64ms之后还没有释放锁的话，她也将 被取消 vip继承权，以此来保证系统资源稳定。
```
#define MAX_INHERIT_GRAN ((u64)(64 * MS_TO_NS))  // 继承vip的最长有效时间
static void dequeue_ux_thread(struct rq *rq, struct task_struct *p)
{
	struct oplus_task_struct *ots = NULL;

	oplus_set_enqueue_time(p, 0);
	ots = get_oplus_task_struct(p);

	if (!oplus_list_empty(&ots->ux_entry)) {
		u64 now = jiffies_to_nsecs(jiffies);

		list_del_init(&ots->ux_entry);
		/* inherit ux can only keep it's ux state in MAX_INHERIT_GRAN(64 ms) */
		if (get_ux_state_type(p) == UX_STATE_INHERIT && (now - ots->inherit_ux_start > MAX_INHERIT_GRAN)) { //
			atomic64_set(&ots->inherit_ux, 0);
			ots->ux_depth = 0;
			ots->ux_state = 0;
			if (unlikely(global_debug_enabled & DEBUG_FTRACE)) {
				trace_printk("dequeue and unset inherit ux task=%-12s pid=%d tgid=%d now=%llu inherit_start=%llu\n",
					p->comm, p->pid, p->tgid, now, ots->inherit_ux_start);
			}
		}
		put_task_struct(p);
	}

	if (p->state != TASK_RUNNING) {
		ots->total_exec = 0;
	}
}
```


## case: 高负载启动动画卡顿
```
桌面UI thread → RenderThread→ hwuitask →surfaceflinger binder →surfaceflinger  -->hwcomper...
```

经常发生 的前面红色这一路都有可能出现runnable影响卡顿的情况，



## 最后

vip_thread 是针对于多核系统的的优化，如果在 单核的简单系统上还是不建议使用，尽量使用单线程去处理。

