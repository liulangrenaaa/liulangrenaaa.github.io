---
title: task_struct 和 thread_info结构
date: 2021-02-19 19:00:00
tags:
    - 进程调度
    - task_struct
    - thread_info
categories:
    - linux内核
slug: "进程管理/task_struct-和-thread_info结构"
---


本文基于 `Linux 5.10` 代码，由于相关结构变化较大，不去考古以前代码了。

## 什么是内核栈？
进程在内核态运行时需要自己的堆栈信息，因此linux内核为每个进程都提供了一个内核栈`kernel stack`(这里的stack就是这个进程在内核态的堆栈信息！！！)。

```
struct task_struct {
#ifdef CONFIG_THREAD_INFO_IN_TASK
	/*
	 * For reasons of header soup (see current_thread_info()), this
	 * must be the first element of task_struct.
	 */
	struct thread_info		thread_info;
#endif
	void				*stack;
    ......
}
```

这个 `void *stack` 就是栈指针，指针指向哪里呢？

内核态的进程访问处于内核数据段的栈，这个栈不同于用户态的进程所用的栈。
用户态进程所用的栈，是在进程线性地址空间中；

而内核栈是当进程从用户空间进入内核空间时，特权级发生变化，需要切换堆栈，内核空间中使用的就是这个内核栈。
因为内核控制路径使用很少的栈空间，所以只需要几千个字节的内核态堆栈。


## thread_info
内核栈还需要存储每个进程的PCB信息,linux内核是支持不同体系的,但是不同的体系结构可能进程需要存储
的信息不尽相同,这就需要我们实现一种通用的方式,我们将体系结构相关的部分和无关的部分进行分离。

1. 用一种通用的方式来描述进程, 这就是struct task_struct
2. 而thread_info就保存了特定体系结构的汇编代码段需要访问的那部分进程的数据
目前基本的配置中（x86_64、我们公司arm64平台都是开启了这个`CONFIG_THREAD_INFO_IN_TASK`）

想通过 从 `task_struct` 找到 `thread_info` 就很简单了，直接结构体访问变量：
```
#ifdef CONFIG_THREAD_INFO_IN_TASK
static inline struct thread_info *task_thread_info(struct task_struct *task)
{
	return &task->thread_info;
}
#endif

#define current_thread_info() ((struct thread_info *)current)
```

x86 架构中
```
struct thread_info {
	unsigned long		flags;		/* low level flags */
	unsigned long		syscall_work;	/* SYSCALL_WORK_ flags */
	u32			status;		/* thread synchronous flags */
};
```


arm64架构中
```
struct thread_info {
	unsigned long		flags;		/* low level flags */
#ifdef CONFIG_ARM64_SW_TTBR0_PAN
	u64			ttbr0;		/* saved TTBR0_EL1 */
#endif
	union {
		u64		preempt_count;	/* 0 => preemptible, <0 => bug */
		struct {
			u32	count;
			u32	need_resched;
		} preempt;
	};
#ifdef CONFIG_SHADOW_CALL_STACK
	void			*scs_base;
	void			*scs_sp;
#endif
};
```


## 如何直接找到 `task_struct`
这就涉及到`thread_union`这个结构了
```
union thread_union {
#ifndef CONFIG_ARCH_TASK_STRUCT_ON_STACK
	struct task_struct task;
#endif
	unsigned long stack[THREAD_SIZE/sizeof(long)];
};
```


我们大部分平台都是开启这个`CONFIG_ARCH_TASK_STRUCT_ON_STACK`宏定义的
`arm64` `x86` 栈都是向下生长，这个结构大概是这样：

```
            +---------------------+
 stack[8k]  |---------------------|  +
            ||                   ||  |
            ||                   ||  |
            ||                   ||  |
            ||                   ||  | Grow Down
            ||                   ||  |
            ||                   ||  |
            ||                   ||  |
            ||                   ||  |
            ||                   ||  |
            ||                   ||  |
  sp<----   +---------------------+  |
            |                     |  |
            |                     |  |
            |                     |  |
            |                     |  |
            |                     |  |
            |                     |  v
            |                     |
            |                     |
            |                     |
            |                     |
            | +-----------------+ |
            | |                 | |
            | |                 | |
            | |                 | |
            | |                 | | +------>   struct task_struct
            | |                 | |
            | |                 | |
            | |                 | |
            | |                 | |
            | |                 | |
            | +-----------------+ |
            | |                 | |
            | |                 | | +------>   struct thread_info
stack[0]    | +-----------------+ |
            +---------------------+
```

有个细节没有体现出来，就是task->stack应该指向 最下面。



我们可以通过 `current()` 获得当前正在运行的线程的 `task_struct` 结构：
arm64 平台
```
static __always_inline struct task_struct *get_current(void)
{
	unsigned long sp_el0;

	asm ("mrs %0, sp_el0" : "=r" (sp_el0));

	return (struct task_struct *)sp_el0;
}

#define current get_current()
```
ARM64增加了很多通用寄存器，使用寄存器传递进程描述符显然效率更高。
因此在ARM64架构里，current宏不再通过栈偏移量得到进程描述符地址，而是借用专门的寄存器 `sp_el0`。

ARM64使用sp_el0，在进程切换时暂存进程描述符地址。

可以看arm64 进程切换arch相关代码(arch/arm64/kernel/entry.S)
```
/*
 * Register switch for AArch64. The callee-saved registers need to be saved
 * and restored. On entry:
 *   x0 = previous task_struct (must be preserved across the switch)
 *   x1 = next task_struct
 * Previous and next are guaranteed not to be the same.
 *
 */
SYM_FUNC_START(cpu_switch_to)
	mov	x10, #THREAD_CPU_CONTEXT
	add	x8, x0, x10
	mov	x9, sp
	stp	x19, x20, [x8], #16		// store callee-saved registers
	stp	x21, x22, [x8], #16
	stp	x23, x24, [x8], #16
	stp	x25, x26, [x8], #16
	stp	x27, x28, [x8], #16
	stp	x29, x9, [x8], #16
	str	lr, [x8]
	add	x8, x1, x10
	ldp	x19, x20, [x8], #16		// restore callee-saved registers
	ldp	x21, x22, [x8], #16
	ldp	x23, x24, [x8], #16
	ldp	x25, x26, [x8], #16
	ldp	x27, x28, [x8], #16
	ldp	x29, x9, [x8], #16
	ldr	lr, [x8]
	mov	sp, x9
	msr	sp_el0, x1
	ptrauth_keys_install_kernel x1, x8, x9, x10
	scs_save x0, x8
	scs_load x1, x8
	ret
SYM_FUNC_END(cpu_switch_to)
NOKPROBE(cpu_switch_to)
```

线程切换的时候
THREAD_CPU_CONTEXT --> x10
x8 保存的压栈大小
x10 + x8 --> x1
x1 --> sp_el0


`THREAD_CPU_CONTEXT` 是什么？
```
DEFINE(THREAD_CPU_CONTEXT,	offsetof(struct task_struct, thread.cpu_context));

struct task_struct {
	/* CPU-specific state of this task: */
	struct thread_struct		thread;

	/*
	 * WARNING: on x86, 'thread_struct' contains a variable-sized
	 * structure.  It *MUST* be at the end of 'task_struct'.
	 *
	 * Do not put anything below here!
	 */
}

struct thread_struct {
	struct cpu_context	cpu_context;	/* cpu context */

	/*
	 * Whitelisted fields for hardened usercopy:
	 * Maintainers must ensure manually that this contains no
	 * implicit padding.
	 */
	struct {
		unsigned long	tp_value;	/* TLS register */
		unsigned long	tp2_value;
		struct user_fpsimd_state fpsimd_state;
	} uw;
    ......
}

struct cpu_context {
	unsigned long x19;
	unsigned long x20;
	unsigned long x21;
	unsigned long x22;
	unsigned long x23;
	unsigned long x24;
	unsigned long x25;
	unsigned long x26;
	unsigned long x27;
	unsigned long x28;
	unsigned long fp;
	unsigned long sp;
	unsigned long pc;
};
```
后面需要更加详细 分析，有空再学习一下然后写。

struct thread_struct & struct pt_regs的区别
thread_struct结构体主要是在内核态两个进程发生切换时，thread_struct用来保存上一个进程的相关寄存器。
pt_regs结构体主要是当用户态的进程陷入到内核态时，需要使用pt_regs来保存用户态进程的寄存器状态。


x86 平台
```
DECLARE_PER_CPU(struct task_struct *, current_task);

static __always_inline struct task_struct *get_current(void)
{
	return this_cpu_read_stable(current_task);
}

#define current get_current()
```
在 x86 平台中，直接使用了 一个 `percpu` 变量来缓存 `current_task` 指针





example: (x86 架构)
```
WARNING: kernel relocated [512MB]: patching 137921 gdb minimal_symbol values                                                        [26/162]

      KERNEL: vmlinux
    DUMPFILE: dump.202103011631  [PARTIAL DUMP]
        CPUS: 4
        DATE: Mon Mar  1 16:31:27 CST 2021
      UPTIME: 00:02:00
LOAD AVERAGE: 1.63, 0.53, 0.19
       TASKS: 449
    NODENAME: rlk-Standard-PC-i440FX-PIIX-1996
     RELEASE: 5.12.0-rc1
     VERSION: #24 SMP Mon Mar 1 14:25:47 CST 2021
     MACHINE: x86_64  (3693 Mhz)
      MEMORY: 4 GB
       PANIC: "Kernel panic - not syncing: softlockup: hung tasks"
         PID: 13
     COMMAND: "kworker/0:1"
        TASK: ffff91344081b240  [THREAD_INFO: ffff91344081b240]
         CPU: 0
       STATE: TASK_RUNNING (PANIC)

crash> bt
PID: 13     TASK: ffff91344081b240  CPU: 0   COMMAND: "kworker/0:1"
bt: seek error: kernel virtual address: ffff98357ffffff8  type: "stack contents"
bt: read of stack at ffff98357ffffff8 failed
crash> struct task_struct ffff91344081b240
struct task_struct {
  thread_info = {
    flags = 16392,
    syscall_work = 0,
    status = 0
  },
  state = 0,
  stack = 0xffff983580070000,
  usage = {
......
```

可以看到 `task` `thread_info` 地址都是 `ffff91344081b240`。
stack地址是`0xffff983580070000`。












参考[linux 进程内核栈](https://zhuanlan.zhihu.com/p/296750228)
参考[Linux调度——神奇的current](http://linux.laoqinren.net/kernel/sched/current/)
参考[Linux syscall过程分析](https://cloud.tencent.com/developer/article/1492374)
参考[do_fork实现--下](https://cloud.tencent.com/developer/article/1603966)

