---
title: linux hungtask问题
date: 2020-09-08 19:00:00
tags:
    - 进程调度
    - hungtask
categories:
    - linux内核
---

## hungtask 定义
我们先看一段实际hungtask的 dmesg打印
```
[45312.818392] INFO: task ftpd:17682 blocked for more than 120 seconds.
[45312.818470]       Tainted: G           OE     5.4.44 #1
[45312.818472] "echo 0 > /proc/sys/kernel/hung_task_timeout_secs" disables this message.
[45312.818474] ftpd     D    0 17682      2 0x80004000
[45312.818478] Call Trace:
[45312.818698]  __schedule+0x2e3/0x740
[45312.818700]  schedule+0x42/0xb0
[45312.818702]  schedule_timeout+0x152/0x2f0
[45312.818755]  ? __next_timer_interrupt+0xe0/0xe0
[45312.818756]  msleep+0x2e/0x40
[45312.818760]  ftpd+0xaa/0x170 [ftpd]
[45312.818804]  kthread+0x104/0x140
[45312.818806]  ? 0xffffffffc05bb000
[45312.818807]  ? kthread_park+0x90/0x90
[45312.818808]  ret_from_fork+0x35/0x40
```
第一行就写了 pid为 17682的 task被 block阻塞了超过120s得不到执行，这种往往只是打印hungtask的线程 和 backtrace而已，实际中一般也不会导致panic，但是这种问题确是我们不能忽略的点，有可能这就是后面会出事故的点

hungtask是内核的一种自我保护行为，在检测到一个线程长时间（可设置）处于D状态之后，会打印出线程相关信息和backtrace.

```
sh@ubuntu:/var/crash$ ps -aux |grep ftpd
root       18007  0.0  0.0      0     0 ?        D    01:01   0:00 [ftpd]
```

D 状态也是进程的一种状态，对应内核中的 TASK_UNINTERRUPTIBLE 状态，一般等待磁盘IO的线程会设置为 TASK_UNINTERRUPTIBLE 状态，此状态无法wakeup，不管是 wake_up_process，还是kill -9去尝试杀死他 都不能将 TASK_UNINTERRUPTIBLE 状态线程唤醒，只有等他自己wakeup。

同时linux内核在统计系统load的时候也将 TASK_UNINTERRUPTIBLE 状态的现场统计了进去，这样如果系统中出现D状态线程之后，整体系统的load就会较高，但是CPU loading却很小，几乎为0。这种统计方式也使得linux系统中loadavg这个参考指标的意义不是那么的大了。

```
sh@ubuntu:~$ top
top - 01:04:54 up 13:09,  3 users,  load average: 2.05, 1.06, 0.49
Tasks: 341 total,   1 running, 340 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.1 us,  0.1 sy,  0.0 ni, 99.8 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3716.5 total,    249.5 free,   2034.2 used,   1432.7 buff/cache
MiB Swap:   2048.0 total,   1557.2 free,    490.8 used.   1398.5 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   2253 rlk       20   0  299752  13200  10788 S   0.3   0.3   0:36.83 vmtoolsd
  18184 rlk       20   0   20700   4292   3384 R   0.3   0.1   0:00.08 top
```

什么样的线程会处于D状态，即 TASK_UNINTERRUPTIBLE 状态呢?
```
1. 磁盘IO线程，在等待磁盘读入数据的过程中会将自己设置为 TASK_UNINTERRUPTIBLE 状态
2. 还有一个 msleep()，这个API会先将线程状态设置为 TASK_UNINTERRUPTIBLE,再调用 schedule_timeouot()

void msleep(unsigned int msecs)
{
	unsigned long timeout = msecs_to_jiffies(msecs) + 1;

	while (timeout)
		timeout = schedule_timeout_uninterruptible(timeout);
}
```

## config配置 hung_task

需要开启如下配置
```
	echo "CONFIG_DETECT_HUNG_TASK=y" >> /tmp/.config
	echo "CONFIG_DEFAULT_HUNG_TASK_TIMEOUT=120" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_HUNG_TASK_PANIC=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_HUNG_TASK_PANIC_VALUE=1" >> /tmp/.config
```


## hungtask 检测的实现
上面讲了hungtask的原理，下面通过代码走读的方式来分析一下hungtask实现细节

首先是init, hungtask机制在初始化的时候使用kthread_run 运行了一个 [khungtaskd]线程，hungtask 主要工作就是在 hungtaskd 线程中完成的
```
//这是主要干活的
static void check_hung_task(struct task_struct *t, unsigned long timeout)
{
	unsigned long switch_count = t->nvcsw + t->nivcsw;

	if (switch_count != t->last_switch_count) { //此task 没有hungtask
		t->last_switch_count = switch_count;
		t->last_switch_time = jiffies;
		return;
	}
	if (time_is_after_jiffies(t->last_switch_time + timeout * HZ))
		return; // 此task虽然hung了，但是还未到 120s == 120 * HZ

	if (sysctl_hung_task_warnings) {
		pr_err("INFO: task %s:%d blocked for more than %ld seconds.\n",
		       t->comm, t->pid, (jiffies - t->last_switch_time) / HZ);
		xxxx //提示信息
		sched_show_task(t);
	}
}

/*
 * Check whether a TASK_UNINTERRUPTIBLE does not get woken up for
 * a really long time (120 seconds). If that happens, print out a warning.
 */
static void check_hung_uninterruptible_tasks(unsigned long timeout)
{
	for_each_process_thread(g, t) { //遍历所有线程
		if (t->state == TASK_UNINTERRUPTIBLE) // check当前线程是否处于D状态
			check_hung_task(t, timeout);
	}
}

/*
 * kthread which checks for tasks stuck in D state
 */
static int watchdog(void *dummy)
{
	unsigned long hung_last_checked = jiffies;

	set_user_nice(current, 0);

	for ( ; ; ) { // 是内核守护线程，所以直接一个for循环
		unsigned long timeout = sysctl_hung_task_timeout_secs;
		unsigned long interval = sysctl_hung_task_check_interval_secs;
		long t;

		if (interval == 0)
			interval = timeout;
		interval = min_t(unsigned long, interval, timeout);
		t = hung_timeout_jiffies(hung_last_checked, interval);
		if (t <= 0) { // 因为最后调用的是 schedule_timout_interruptible()，可以被唤醒，所以需要判断一下
			if (!atomic_xchg(&reset_hung_task, 0) && !hung_detector_suspended)
				check_hung_uninterruptible_tasks(timeout); // 给所有线程检查是否处于D状态
			hung_last_checked = jiffies;
			continue;
		}
		schedule_timeout_interruptible(t);
	}

	return 0;
}

static int __init hung_task_init(void) // 初始化 khungtaskd，主体是 watchdog 函数
{
	atomic_notifier_chain_register(&panic_notifier_list, &panic_block);

	/* Disable hung task detector on suspend */
	pm_notifier(hungtask_pm_notify, 0);

	watchdog_task = kthread_run(watchdog, NULL, "khungtaskd");

	return 0;
}
subsys_initcall(hung_task_init);
```
hungtask机制  如何判断这个线程一直没有进行切换得到运行呢？
主要用的是 task_struct的几个成员， nvcsw nivcsw last_switch_count
分别对应 非自愿上下文切换次数，自愿上下文切换次数，上次检查时上下文总切换次数。
通过在扫描时，比较这几个成员的值就可以清晰的看到在两次扫描之间有没有进行过上下文切换

hungtask机制  如何判断这个线程超过120s都没有得到运行呢？
主要用的是 task_struct 的 last_switch_time 成员，利用 last_switch_time + timeout * HZ 和 jiffies 比较就可以轻易得出是否超过120s没有被调度过

## hungtask 行为控制
一般系统中出现hungtask 可能都是短暂的异常，一般就打印一下 info 和 backtrace 即可，但是kernel也提供了相关的选择，比如可以选择hungtask的时候直接panic

```
echo 1 >  /proc/sys/kernel/hung_task_panic # hungtask的时候直接 panic
echo 120 > /proc/sys/kernel/hung_task_timeout_secs # 一个任务处于D状态多久我们认为他是hungtask了
echo 3 > /proc/sys/kernel/hung_task_check_interval_secs # 内核多久进行一次hungtask扫描
echo 7 > /proc/sys/kernel/hung_task_warnings # 设置hungtask的warning的等级
```

其实这些控制参数都对应在上面代码中，由于篇幅原因，精简了一下代码

## 总结
一般hungtask出现，肯定会伴随着 D状态 的线程产生，且超过设定时间一直处于D状态，没有被调度过

D状态，即 TASK_UNINTERRUPTIBLE 线程，一般产生于
1. IO磁盘等待上
2. msleep 调用接口上
3. 一些锁机制在等待锁的持有者的时候也会将线程状态设为 TASK_UNINTERRUPTIBLE，那样如果出现某些类型锁的死锁的时候也会出现 hungtask

贴一个其他博客：[进程D状态死锁检测](https://e-mailky.github.io/2017-01-18-kernel-daedlock-check)