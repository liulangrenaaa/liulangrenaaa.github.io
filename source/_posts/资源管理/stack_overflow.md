---
title: stack_overflow
date: 2021-01-27 19:00:00
tags:
    - stack_overflow
    - 内核栈溢出
categories:
    - linux内核
---


## stack_overflow 概述
一般linux内核栈大小都是`8kb`，当内核中调用层次太多，或者局部变量太大的时候，就会使得栈实际使用的大小超过8Kb，但是8kb之外就是别的内存了，不属于当前task的 `stack`了。一般会破坏其他task的`stack`或者其他的重要数据结构(slub等)，轻则导致运行的程序的异常，重则导致系统直接`panic`，而且由于破坏数据结构不确定，panic的位置也是不确定的，所以往往很难定位这种问题。

## stack_overflow 如何检测
### 传统RTOS上如何做的？

这是我大四总结的RTOS栈溢出如何检测的节选
1. 检查指针：每次任务切换时检查栈指针是在合法范围内（是否越界），但是仍然存在检测不到情况，比如在任务执行过程中栈指针越界了，但是在任务切换前，栈指针pop到了合法位置。
2. 检查数据：将栈空间顶部16字节数据初始化一定值如0XA5，然后在每次任务切换的时候检查栈顶部16字节有没有改变，如果改变了就说明肯定栈溢出了，想较于检查指针方法费时费事。但是仍然可能检测不到栈溢出，比如虽然溢出但是栈顶部数据没有被修改，溢出后的数据被修改了。

### linux上如何做的？
其实在`linux` 系统上也无外乎这几种方法。（其实多了一种方法）
1. 首先linux会在`kernel stack`的结尾处放置一个`magic num`，就是方法2
```
void set_task_stack_end_magic(struct task_struct *tsk) {
	*end_of_stack(tsk) = STACK_END_MAGIC;	/* for overflow detection */
}

asmlinkage __visible void __init __no_sanitize_address start_kernel(void) {
	set_task_stack_end_magic(&init_task);
}

static struct task_struct *dup_task_struct(struct task_struct *orig, int node) {
        setup_thread_stack(tsk, orig);
	clear_user_return_notifier(tsk);
	clear_tsk_need_resched(tsk);
	set_task_stack_end_magic(tsk);
}

static __latent_entropy struct task_struct *copy_process(...) {
        p = dup_task_struct(current, node);
        ......
}
```

那么何时来检测呢？
```
#define STACK_END_MAGIC		0x57AC6E9D
#define task_stack_end_corrupted(task) \
		(*(end_of_stack(task)) != STACK_END_MAGIC)

static inline void schedule_debug(struct task_struct *prev, bool preempt)
{
#ifdef CONFIG_SCHED_STACK_END_CHECK
	if (task_stack_end_corrupted(prev))
		panic("corrupted stack end detected inside scheduler\n");

	if (task_scs_end_corrupted(prev))
		panic("corrupted shadow stack detected inside scheduler\n");
#endif
}
```
这个功能还需要 开启 `CONFIG_SCHED_STACK_END_CHECK` 配置。

2. 使用虚拟内存的特性来保证。
以前内核栈都是通过连续物理内存页面来分配的，且是线性映射的内存，这样做的好处是减少了部分开销。
但是这样也导致如果发生栈溢出，就是真切的踩到别的物理内存了。
所以内核提供了一个新的方式，配置`CONFIG_VMAP_STACK`之后，可以使用 vmalloc的方式来提供栈空间，由于 `vmalloc` 还提供了 `guard page`机制，所以一旦检测到栈溢出，就可以立即报告出来。
由这个commit：(ba14a194a434ccc8f733e263ad2ce941e35e5787)加入,
后面又优化了一把(ac496bf48d97f2503eaa353996a4dd5e4383eaf0)，主要是用`cached_stacks` 这个 percpu 变量缓存了 一些vmalloc页面。
```
static unsigned long *alloc_thread_stack_node(struct task_struct *tsk, int node){
#ifdef CONFIG_VMAP_STACK
	void *stack;
	stack = __vmalloc_node_range(THREAD_SIZE, THREAD_ALIGN,
				     VMALLOC_START, VMALLOC_END,
				     THREADINFO_GFP & ~__GFP_ACCOUNT,
				     PAGE_KERNEL,
				     0, node, __builtin_return_address(0));
	return stack;
#else
	struct page *page = alloc_pages_node(node, THREADINFO_GFP,THREAD_SIZE_ORDER);

	if (likely(page)) {
		tsk->stack = kasan_reset_tag(page_address(page));
		return tsk->stack;
	}
	return NULL;
#endif
}

static struct task_struct *dup_task_struct(struct task_struct *orig, int node) {
	stack = alloc_thread_stack_node(tsk, node);
}
```

3. gcc特性保证
可以在函数
在gcc编译的时候，加入"-fstack-protector"选项即可。每个函数会对应一个stack frame，
这样每个stack frame都需要一个canary，这会消耗掉一部分的栈空间。
此外，由于每次函数返回时都需要检测canary，代码的整执行时间也势必会增加。

```
jenkins@server:~/workspace/linux_kernel_ltp$ cat ./debug_out/.config | grep STACKPROTECTOR
CONFIG_CC_HAS_SANE_STACKPROTECTOR=y
CONFIG_HAVE_STACKPROTECTOR=y
CONFIG_STACKPROTECTOR=y
CONFIG_STACKPROTECTOR_STRONG=y
```

看`makefile`文件
```
stackp-flags-y                                    := -fno-stack-protector
stackp-flags-$(CONFIG_STACKPROTECTOR)             := -fstack-protector
stackp-flags-$(CONFIG_STACKPROTECTOR_STRONG)      := -fstack-protector-strong
KBUILD_CFLAGS += $(stackp-flags-y)
```
可以参考[文章1](https://www.cnblogs.com/arnoldlu/p/11630979.html)
可以参考[文章2](https://www.cnblogs.com/gm-201705/p/9863958.html)

## stack_overflow 配置
1. 开启`CONFIG_SCHED_STACK_END_CHECK`，关闭`CONFIG_VMAP_STACK`查看效果
参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/memory/stack_overflow/stack_overflow.c)

```
crash> log | tail -n 18
[   16.480669] systemd-journald[122]: File /var/log/journal/99626a991f7d4bfa8cb2df0e3b8ce643/user-1000.journal corrupted or uncleanly shut .
[   28.311464] rfkill: input handler disabled
[   32.585818] loop0: detected capacity change from 63672 to 0
[   33.713469] loop0: detected capacity change from 113424 to 0
[   36.372258] stack_overflow: loading out-of-tree module taints kernel.
[   37.396337] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 9
[   38.420098] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 8
[   39.444356] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 7
[   39.444369] Kernel panic - not syncing: corrupted stack end detected inside scheduler
[   39.445278] CPU: 3 PID: 3378 Comm: k_stackoverflow Kdump: loaded Tainted: G           O      5.11.0-rc5+ #10
[   39.445278] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   39.445278] Call Trace:
[   39.445278]  ? k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[   39.445278]  ? k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[   39.445278]  ? k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[   39.445278]  ? kthread+0x10a/0x140
[   39.445278]  ? kthread_park+0x80/0x80
[   39.445278]  ? ret_from_fork+0x22/0x30
crash>
crash> bt
PID: 3378   TASK: ffff8fce4d6d4b40  CPU: 3   COMMAND: "k_stackoverflow"
bt: invalid size request: 0  type: "stack contents"
bt: read of stack at fffffe00000b1000 failed
```

可以看到报错信息，显示很明显，打印出了backtrace
```
[   39.444369] Kernel panic - not syncing: corrupted stack end detected inside scheduler
```
但是看到`bt` 命令已经不能正常显示了。

2. 开启`CONFIG_VMAP_STACK`，使用虚拟内存机制保证
参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/memory/stack_overflow/stack_overflow.c)
重新编译内核启动，编译安装test 驱动，得到如下报错信息，由于检测到栈溢出，直接panic了，需要 crash查看现场信息
```
[ 1188.110899] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 9
[ 1189.134809] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 8
[ 1190.158790] k_stackoverflow_thread have alloc 4096 bytes in stack, times = 7
[ 1190.159424] BUG: stack guard page was hit at 000000009af4b1c0 (stack is 0000000013046cba..00000000bab11d7d)
[ 1190.159427] kernel stack overflow (double-fault): 0000 [#1] SMP NOPTI
[ 1190.159428] CPU: 1 PID: 3607 Comm: k_stackoverflow Kdump: loaded Tainted: G           O      5.11.0-rc5+ #8
[ 1190.159430] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[ 1190.159431] RIP: 0010:k_stackoverflow_thread+0x8/0x80 [stack_overflow]
[ 1190.159433] Code: Unable to access opcode bytes at RIP 0xffffffffc0238fde.
[ 1190.159434] RSP: 0018:ffff9cc38089bec0 EFLAGS: 00010286
[ 1190.159436] RAX: 0000000000000040 RBX: ffffffffc0239000 RCX: 0000000000000000
[ 1190.159438] RDX: 0000000000000000 RSI: ffff8bc8bfc97fd0 RDI: 0000000000000000
[ 1190.159439] RBP: 0000000000000000 R08: ffff8bc8bfc97fd0 R09: 0000000000000001
[ 1190.159440] R10: 0000000000000001 R11: 0000000000000001 R12: ffff8bc857788040
[ 1190.159441] R13: ffff9cc380907ba8 R14: 0000000000000000 R15: ffff8bc8843a0040
[ 1190.159443] FS:  0000000000000000(0000) GS:ffff8bc8bfc80000(0000) knlGS:0000000000000000
[ 1190.159444] CS:  0010 DS: 0000 ES: 0000 CR0: 0000000080050033
[ 1190.159445] CR2: ffffffffc0238fde CR3: 000000001627c000 CR4: 00000000000006e0
[ 1190.159446] Call Trace:
[ 1190.159447]  ? __lock_acquire+0x3be/0x28a0
[ 1190.159448]  ? __lock_acquire+0x3be/0x28a0
[ 1190.159486]  ? rcu_read_lock_sched_held+0x4d/0x80
[ 1190.159487]  ? __lock_acquire+0x3be/0x28a0
[ 1190.159488]  ? __lock_acquire+0x3be/0x28a0
[ 1190.159489]  ? desc_read_finalized_seq+0x26/0x80
[ 1190.159490]  ? find_held_lock+0x2b/0x80
[ 1190.159491]  ? console_unlock+0x35f/0x570
[ 1190.159492]  ? lockdep_hardirqs_on_prepare+0xd4/0x170
[ 1190.159493]  ? console_unlock+0x487/0x570
[ 1190.159494]  ? __irq_work_queue_local+0x48/0x50
[ 1190.159495]  ? irq_work_queue+0x20/0x30
[ 1190.159495]  ? wake_up_klogd.part.0+0x32/0x40
[ 1190.159496]  ? vprintk_emit+0x98/0x2a0
[ 1190.159497]  ? 0xffffffffc0239000
[ 1190.159498]  ? printk+0x53/0x6a
[ 1190.159499]  k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[ 1190.159500]  k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[ 1190.159501]  k_stackoverflow_thread.cold+0x16/0x20 [stack_overflow]
[ 1190.159502]  kthread+0x10a/0x140
[ 1190.159503]  ? kthread_park+0x80/0x80
[ 1190.159504]  ret_from_fork+0x22/0x30
[ 1190.159505] Modules linked in: stack_overflow(O)
crash>
```

可以很明显看到报错信息指出是 `stack overflow`
```
[ 1190.159424] BUG: stack guard page was hit at 000000009af4b1c0 (stack is 0000000013046cba..00000000bab11d7d)
[ 1190.159427] kernel stack overflow (double-fault): 0000 [#1] SMP NOPTI
```
反汇编一下就可以知道函数地址，结合 backtrace 就看可以知道具体原因

3. gcc 相关参数``  ``默认开启的？
我试了一下，有栈溢出，但是没有触发报错，后面有空再看...
```
jenkins@server:~/workspace/linux_kernel_ltp$ cat debug_out/.config |grep STACKPROTECTOR
CONFIG_CC_HAS_SANE_STACKPROTECTOR=y
CONFIG_HAVE_STACKPROTECTOR=y
CONFIG_STACKPROTECTOR=y
CONFIG_STACKPROTECTOR_STRONG=y
jenkins@server:~/workspace/linux_kernel_ltp$
```

## 总结
1. 开启 `CONFIG_SCHED_STACK_END_CHECK` 是有一定 overhead的，每次sched的时候都会去检
查栈顶的 `magic num`有无被修改过，且这个也不一定准确，也可能是虽然栈溢了，但是恰好没有
改写到 `magic num`的数据，这种就比较难办。

2. 开启 `CONFIG_VMAP_STACK`，相对来说 overhead 就少很多了，现在 64bit kernel都是默
认打开这个宏定义的，32bit 猜测主要可能是 vmalloc区域太小。


參考[知乎文章](https://zhuanlan.zhihu.com/p/84591715)

参考[文章1](https://github.com/hardenedlinux/grsecurity-101-tutorials/blob/master/grsec-code-analysis/kstack.md)

參考[文章2](https://github.com/hardenedlinux/grsecurity-101-tutorials/blob/master/grsec-code-analysis/KSTACKOVERFLOW.md)