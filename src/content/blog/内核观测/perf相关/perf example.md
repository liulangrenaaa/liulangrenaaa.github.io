---
title: perf example
date: 2021-07-15 19:00:40
tags:
    - perf
    - filesystem
categories:
    - linux内核
slug: "内核观测/perf相关/perf-example"
---



## perf_event_open demo
performance counters 是在现代cpu上的一种特殊硬件寄存器，可以对某些特定hw events进行计数，比如指令执行数目，cache miss数量等。
perf 子系统给应用层单独开放的接口 是 `perf_event_open`，会返回 一个fd，后续的操作都是围绕这个 fd来的，可以用 ioctl,fcntl 来控制这个fd。


```
#include <stdio.h>
#include <string.h>
#include <stdint.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <linux/perf_event.h>
#include <sys/ioctl.h>

//目前perf_event_open在glibc中没有封装，需要手工封装一下
int perf_event_open(struct perf_event_attr *attr, pid_t pid, int cpu, int group_fd, unsigned long flags)
{
    return syscall(__NR_perf_event_open, attr, pid, cpu, group_fd, flags);
}

/**
 * read instructions
*/
int main(void)
{
    struct perf_event_attr attr;
    memset(&attr, 0, sizeof(struct perf_event_attr));
    attr.size = sizeof(struct perf_event_attr);
    //监测硬件
    attr.type = PERF_TYPE_HARDWARE;
    //监测指令数
    attr.config = PERF_COUNT_HW_INSTRUCTIONS;
    //初始状态为禁用
    attr.disabled = 1;

    //创建perf文件描述符，其中pid=0,cpu=-1表示监测当前进程，不论运行在那个cpu上
    int fd = perf_event_open(&attr, 0, -1, -1, 0);
    if (fd < 0) {
        perror("Cannot open perf fd!");
        return 1;
    }

    //启用（开始计数）
    ioctl(fd, PERF_EVENT_IOC_ENABLE, 0);
    while (1) {
        uint64_t instructions;
        //读取最新的计数值
        read(fd, &instructions, sizeof(instructions));
        printf("instructions = %ld\n", instructions);
        sleep(1);
    }
}
```

编译运行
```
ubuntu@zeku_server:~/workspace/share/test_modules/performance/perf_event_open $ gcc perf_count.c
ubuntu@zeku_server:~/workspace/share/test_modules/performance/perf_event_open $ sudo ./a.out
instructions = 7516
instructions = 82866
^C
```

## 接口分析
通过 `perf_event_open`、`ioctl` 等实现了 `perf` 部分功能。
调用`perf_event_open` 之前需要先构造`attr`，attr属性主要有
`type`，主要有六类
```
/*
 * attr.type
 */
enum perf_type_id {
	PERF_TYPE_HARDWARE			= 0,
	PERF_TYPE_SOFTWARE			= 1,
	PERF_TYPE_TRACEPOINT			= 2,
	PERF_TYPE_HW_CACHE			= 3,
	PERF_TYPE_RAW				= 4,
	PERF_TYPE_BREAKPOINT			= 5,

	PERF_TYPE_MAX,				/* non-ABI */
};
```

每个type还有具体细分
如 `perf_hw_cache_id` `perf_hw_cache_op_id` `perf_hw_cache_op_result_id` `perf_sw_ids` 等：
```
/*
 * Generalized hardware cache events:
 *
 *       { L1-D, L1-I, LLC, ITLB, DTLB, BPU, NODE } x
 *       { read, write, prefetch } x
 *       { accesses, misses }
 */
enum perf_hw_cache_id {
	PERF_COUNT_HW_CACHE_L1D			= 0,
	PERF_COUNT_HW_CACHE_L1I			= 1,
	PERF_COUNT_HW_CACHE_LL			= 2,
	PERF_COUNT_HW_CACHE_DTLB		= 3,
	PERF_COUNT_HW_CACHE_ITLB		= 4,
	PERF_COUNT_HW_CACHE_BPU			= 5,
	PERF_COUNT_HW_CACHE_NODE		= 6,

	PERF_COUNT_HW_CACHE_MAX,		/* non-ABI */
};

enum perf_hw_cache_op_id {
	PERF_COUNT_HW_CACHE_OP_READ		= 0,
	PERF_COUNT_HW_CACHE_OP_WRITE		= 1,
	PERF_COUNT_HW_CACHE_OP_PREFETCH		= 2,

	PERF_COUNT_HW_CACHE_OP_MAX,		/* non-ABI */
};

enum perf_hw_cache_op_result_id {
	PERF_COUNT_HW_CACHE_RESULT_ACCESS	= 0,
	PERF_COUNT_HW_CACHE_RESULT_MISS		= 1,

	PERF_COUNT_HW_CACHE_RESULT_MAX,		/* non-ABI */
};

/*
 * Special "software" events provided by the kernel, even if the hardware
 * does not support performance events. These events measure various
 * physical and sw events of the kernel (and allow the profiling of them as
 * well):
 */
enum perf_sw_ids {
	PERF_COUNT_SW_CPU_CLOCK			= 0,
	PERF_COUNT_SW_TASK_CLOCK		= 1,
	PERF_COUNT_SW_PAGE_FAULTS		= 2,
	PERF_COUNT_SW_CONTEXT_SWITCHES		= 3,
	PERF_COUNT_SW_CPU_MIGRATIONS		= 4,
	PERF_COUNT_SW_PAGE_FAULTS_MIN		= 5,
	PERF_COUNT_SW_PAGE_FAULTS_MAJ		= 6,
	PERF_COUNT_SW_ALIGNMENT_FAULTS		= 7,
	PERF_COUNT_SW_EMULATION_FAULTS		= 8,
	PERF_COUNT_SW_DUMMY			= 9,
	PERF_COUNT_SW_BPF_OUTPUT		= 10,
	PERF_COUNT_SW_CGROUP_SWITCHES		= 11,

	PERF_COUNT_SW_MAX,			/* non-ABI */
};
```


## pid cpu 参数
```
pid == 0 and cpu == -1
      This measures the calling process/thread on any CPU.

pid == 0 and cpu >= 0
      This measures the calling process/thread only when running on the specified CPU.

pid > 0 and cpu == -1
      This measures the specified process/thread on any CPU.

pid > 0 and cpu >= 0
      This measures the specified process/thread only when running on the specified CPU.

pid == -1 and cpu >= 0
      This  measures  all  processes/threads on the specified CPU.  This requires CAP_PERFMON (since Linux 5.8) or
      CAP_SYS_ADMIN capability or a /proc/sys/kernel/perf_event_paranoid value of less than 1.

pid == -1 and cpu == -1
      This setting is invalid and will return an error.
```


## perf tool 分析
perf tool 提供了多种多样的功能，是使用 perf tool的关键
```
static struct cmd_struct commands[] = {
	{ "buildid-cache", cmd_buildid_cache, 0 },
	{ "buildid-list", cmd_buildid_list, 0 },
	{ "config",	cmd_config,	0 },
	{ "c2c",	cmd_c2c,	0 },
	{ "diff",	cmd_diff,	0 },
	{ "evlist",	cmd_evlist,	0 },
	{ "help",	cmd_help,	0 },
	{ "kallsyms",	cmd_kallsyms,	0 },
	{ "list",	cmd_list,	0 },
	{ "record",	cmd_record,	0 },
	{ "report",	cmd_report,	0 },
	{ "bench",	cmd_bench,	0 },
	{ "stat",	cmd_stat,	0 },
	{ "timechart",	cmd_timechart,	0 },
	{ "top",	cmd_top,	0 },
	{ "annotate",	cmd_annotate,	0 },
	{ "version",	cmd_version,	0 },
	{ "script",	cmd_script,	0 },
	{ "sched",	cmd_sched,	0 },
#ifdef HAVE_LIBELF_SUPPORT
	{ "probe",	cmd_probe,	0 },
#endif
	{ "kmem",	cmd_kmem,	0 },
	{ "lock",	cmd_lock,	0 },
	{ "kvm",	cmd_kvm,	0 },
	{ "test",	cmd_test,	0 },
#if defined(HAVE_LIBAUDIT_SUPPORT) || defined(HAVE_SYSCALL_TABLE_SUPPORT)
	{ "trace",	cmd_trace,	0 },
#endif
	{ "inject",	cmd_inject,	0 },
	{ "mem",	cmd_mem,	0 },
	{ "data",	cmd_data,	0 },
	{ "ftrace",	cmd_ftrace,	0 },
	{ "daemon",	cmd_daemon,	0 },
};
```

参考[perf-perf stat用户层代码分析](https://www.cnblogs.com/muahao/p/8933384.html)




参考[design.txt](https://github.com/torvalds/linux/blob/master/tools/perf/design.txt)




1. kprobe 与 function tracer 挂的钩子有啥不一样？
2. trigger  -snapshot  -stacktrace -其他事件
3. perf ebpf kprobe_event 关系 函数
4. kprobe 实现 1. 基于 ftrace 2. 基于 breakpoint
5.
