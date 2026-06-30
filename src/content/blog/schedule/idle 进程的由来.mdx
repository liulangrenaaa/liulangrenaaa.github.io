---
title: idle 进程的由来
date: 2021-06-15 19:00:00
tags:
    - schedule
categories:
    - linux kernel
    - linux schedule
    - idle
slug: "schedule/idle-进程的由来"
---




## idle 线程
linux 中给 per cpu都安排了一个结构`runqueue`，只要此 runqueue中有 runnable的thread,
scheduler 就不会进入 idle状态；相反，只要没有runnable的task，scheduler就会执行 `idle task`，使得cpu进入 idle模式。


## idle 线程如何产生的？
### 单cpu core架构中
```
void cpu_startup_entry(enum cpuhp_state state)
{
	arch_cpu_idle_prepare();
	cpuhp_online_idle(state);
	while (1)
		do_idle();
}

noinline void __ref rest_init(void)
{
        ......
	cpu_startup_entry(CPUHP_ONLINE);
}

void __init __weak arch_call_rest_init(void)
{
	rest_init();
}

asmlinkage __visible void __init __no_sanitize_address start_kernel(void)
{
        ......
      	arch_call_rest_init();
}
```


### smp架构中
smp 架构在boot的时候也是单cpu 先boot,然后结果smp_init()，将系统中其他cpu boot起来。
所以在 boot cpu中，idle线程还是通过 `rest_init()` 产生的。

非 `boot cpu` 的情况下，idle 线程是通过`idle_threads_init()` 产生的：
```
static inline void idle_init(unsigned int cpu)
{
	struct task_struct *tsk = per_cpu(idle_threads, cpu);

	if (!tsk) {
		tsk = fork_idle(cpu);
		if (IS_ERR(tsk))
			pr_err("SMP: fork_idle() failed for CPU %u\n", cpu);
		else
			per_cpu(idle_threads, cpu) = tsk;
	}
}

/**
 * idle_threads_init - Initialize idle threads for all cpus
 */
void __init idle_threads_init(void)
{
	unsigned int cpu, boot_cpu;

	boot_cpu = smp_processor_id();

	for_each_possible_cpu(cpu) {
		if (cpu != boot_cpu)
			idle_init(cpu);
	}
}

/* Called by boot processor to activate the rest. */
void __init smp_init(void)
{
        ......
	idle_threads_init();
}

static noinline void __init kernel_init_freeable(void)
{
        ......
	smp_init();
}

static int __ref kernel_init(void *unused)
{
	......
	kernel_init_freeable();
}

noinline void __ref rest_init(void)
{
        ......
	pid = kernel_thread(kernel_init, NULL, CLONE_FS);
}
```

rest_init
  -- kernel_init
    -- kernel_init_freeable
      -- smp_init
        -- idle_threads_init
          -- idle_init




## idle 线程干了啥？

后续熟悉 arm cpu指令再补充..

