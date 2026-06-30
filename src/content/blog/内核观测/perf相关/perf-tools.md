---
title: perf-tools
date: 2021-01-28 19:00:00
tags:
    - perf
categories:
    - kernel debug
slug: "内核观测/perf相关/perf-tools"
---



## 介绍
翻译自[github文档](https://github.com/brendangregg/perf-tools)
用于 Linux ftrace 和 perf_events（又名“perf”命令）的一系列开发中和不受支持的性能分析工具。 ftrace 和 perf 都是内核源代码中包含的核心 Linux 跟踪工具。 您的系统可能已经有 ftrace，而 perf 通常只是一个包添加（请参阅先决条件）。

这些工具被设计为易于安装（最少的依赖项），提供高级性能可观察性，并且易于使用：做一件事并做好。 该集合由 Brendan Gregg（DTraceToolkit 的作者）创建。

这些工具中的许多都采用了变通方法，以便在现有 Linux 内核上实现功能。 因此，许多工具都有警告（请参阅手册页），在添加未来的内核功能或新的跟踪子系统之前，应将它们的实现视为占位符。



在 仓库根目录还有各个目录下，有多个 shell 脚本:
```
iosnoop: trace disk I/O with details including latency. Examples.
iolatency: summarize disk I/O latency as a histogram. Examples.
execsnoop: trace process exec() with command line argument details. Examples.
opensnoop: trace open() syscalls showing filenames. Examples.
killsnoop: trace kill() signals showing process and signal details. Examples.
fs/cachestat: basic cache hit/miss statistics for the Linux page cache. Examples.
net/tcpretrans: show TCP retransmits, with address and other details. Examples.
system/tpoint: trace a given tracepoint. Examples.
kernel/funccount: count kernel function calls, matching a string with wildcards. Examples.
kernel/functrace: trace kernel function calls, matching a string with wildcards. Examples.
kernel/funcslower: trace kernel functions slower than a threshold. Examples.
kernel/funcgraph: trace a graph of kernel function calls, showing children and times. Examples.
kernel/kprobe: dynamically trace a kernel function call or its return, with variables. Examples.
user/uprobe: dynamically trace a user-level function call or its return, with variables. Examples.
tools/reset-ftrace: reset ftrace state if needed. Examples.
```

在 ./bin 目录下有以上各个shell 的软连接，所以执行这些工具直接到 bin目录即可：
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ls
bitesize   funccount   functrace  killsnoop  perf-stat-hist  tcpretrans
cachestat  funcgraph   iolatency  kprobe     reset-ftrace    tpoint
execsnoop  funcslower  iosnoop    opensnoop  syscount        uprobe
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```


## demo
perf-tools 里面的一些工具在 trace 方面很实用，相见恨晚！下面记录几个 demo:


### funccount
count kernel function calls, matching a string with wildcards.
主要用来统计 函数调用，可以搭配通配符来使用
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funccount "bio_*"
Tracing "bio_*"... Ctrl-C to end.
^C
FUNC                              COUNT
bio_attempt_front_merge               1
bio_attempt_back_merge               82
bio_crypt_ctx_mergeable              83
bio_crypt_rq_ctx_compatible         364
bio_alloc_bioset                    378
bio_associate_blkg                  378
bio_endio                           378
bio_free                            378
bio_integrity_prep                  378
bio_put                             378
bio_advance                         382
bio_associate_blkg_from_css         442
bio_uninit                          756
bio_add_page                        815

Ending tracing...
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```

+ -i : 间隔s输出结果
+ -t : 输出 top x 的结果
+ -d : 总共trace 的时间多久

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funccount  -i 2 -t 2 -d 4 "bio_*"
Tracing "bio_*" for 4 seconds. Top 2 only...

FUNC                              COUNT
bio_uninit                           22
bio_crypt_rq_ctx_compatible          55

FUNC                              COUNT
bio_associate_blkg_from_css          11
bio_uninit                           20

Ending tracing...
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```


#### 为啥可以支持通配符？

在 `/sys/kernel/debug/tracing/available_filter_functions` 中记录了所有可以被 trace的 symbol.
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# cat /sys/kernel/debug/tracing/available_filter_functions | wc -l
67030
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```
可以使用带通配符的 string 到 这个文件中去查找符号条件的 `function`。



### functrace
trace kernel function calls, matching a string with wildcards,支持通配符

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./functrace "kmem_cache_alloc_*"
Tracing "kmem_cache_alloc_*"... Ctrl-C to end.
       functrace-1512675 [009] .... 1298127.500687: kmem_cache_alloc_node <-dup_task_struct
       functrace-1512675 [009] .... 1298127.500709: kmem_cache_alloc_trace <-alloc_fdtable
           <...>-1512680 [001] .... 1298127.501196: kmem_cache_alloc_trace <-alloc_bprm
           <...>-1512680 [001] .... 1298127.501320: kmem_cache_alloc_trace <-load_elf_binary
            node-3706960 [008] .... 1298127.503100: kmem_cache_alloc_node <-__alloc_skb
            node-3706960 [008] .... 1298127.503428: kmem_cache_alloc_node <-__alloc_skb
```

使用 `-H` 显示 header:
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./functrace -H "kmem_cache_alloc_*"
Tracing "kmem_cache_alloc_*"... Ctrl-C to end.
^C# tracer: function
#
# entries-in-buffer/entries-written: 30/30   #P:12
#
#                                _-----=> irqs-off
#                               / _----=> need-resched
#                              | / _---=> hardirq/softirq
#                              || / _--=> preempt-depth
#                              ||| /     delay
#           TASK-PID     CPU#  ||||   TIMESTAMP  FUNCTION
#              | |         |   ||||      |         |
       functrace-1512958 [003] .... 1298157.804761: kmem_cache_alloc_node <-dup_task_struct
       functrace-1512958 [003] .... 1298157.804774: kmem_cache_alloc_trace <-alloc_fdtable
             cat-1512960 [011] .... 1298157.805012: kmem_cache_alloc_trace <-alloc_bprm
```

### funcslower

 trace kernel functions slower than a threshold.

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funcslower ext4_mpage_readpages 10
Tracing "ext4_mpage_readpages" slower than 10 us... Ctrl-C to end.
 11) + 12.260 us   |  } /* ext4_mpage_readpages */
  8) + 30.049 us   |  } /* ext4_mpage_readpages */
  8) + 13.164 us   |  } /* ext4_mpage_readpages */
  8) + 21.117 us   |  } /* ext4_mpage_readpages */
  9) + 17.850 us   |  } /* ext4_mpage_readpages */
  9) + 13.449 us   |  } /* ext4_mpage_readpages */
 10) + 16.533 us   |  } /* ext4_mpage_readpages */
  0) + 32.654 us   |  } /* ext4_mpage_readpages */
  0) + 12.850 us   |  } /* ext4_mpage_readpages */
  0) + 20.576 us   |  } /* ext4_mpage_readpages */
```

假设 你怀疑系统中某个问题是由于 `ext4_mpage_readpages` 执行慢导致的，那么可以使用这个 cmd 来确认一下

可以使用 `-Pt` 显示更详细信息

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funcslower -Pt ext4_mpage_readpages 10
Tracing "ext4_mpage_readpages" slower than 10 us... Ctrl-C to end.
1298799.300724 |    7)  bash-1518301  | + 25.581 us   |  } /* ext4_mpage_readpages */
1298799.305213 |    7) cksum-1518301  | + 14.441 us   |  } /* ext4_mpage_readpages */
```



### funcgraph

trace a graph of kernel function calls, showing children and times.

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funcgraph schedule
Tracing "schedule"... Ctrl-C to end.
  4)   1.768 us    |  file_ra_state_init();
  4)               |  schedule() {
  4)               |    rcu_note_context_switch() {
  4)   0.382 us    |      rcu_qs();
  4)   0.998 us    |    }
  4)   0.320 us    |    _raw_spin_lock();
  4)   0.351 us    |    update_rq_clock();
  4)               |    psi_task_change() {
  4)   0.285 us    |      psi_flags_change();
  4)               |      psi_group_change() {
  4)   0.430 us    |        record_times();
  4)   1.344 us    |      }
  4)               |      psi_group_change() {
  4)   0.333 us    |        record_times();
  4)   0.909 us    |      }
  4)               |      psi_group_change() {
  4)   0.384 us    |        record_times();
  4)   0.965 us    |      }
  4)               |      psi_group_change() {
  4)   0.337 us    |        record_times();
  4)   0.900 us    |      }
  4)   6.000 us    |    }
  4)               |    dequeue_task_fair() {
  4)               |      dequeue_entity() {
  4)               |        update_curr() {
  4)   0.277 us    |          update_min_vruntime();
  4)               |          cpuacct_charge() {
  4)   0.323 us    |            rcu_read_unlock_strict();
  4)   0.874 us    |          }
  4)               |          __cgroup_account_cputime() {
  4)   0.283 us    |            cgroup_rstat_updated();
  4)   0.814 us    |          }
  4)   0.288 us    |          rcu_read_unlock_strict();
  4)   3.616 us    |        }
  4)   0.488 us    |        __update_load_avg_se();
  4)   0.518 us    |        __update_load_avg_cfs_rq();
  4)   0.284 us    |        clear_buddies();
  4)   0.318 us    |        update_cfs_group();
  4)   0.304 us    |        update_min_vruntime();
  4)   7.470 us    |      }
  4)               |      dequeue_entity() {
  4)               |        update_curr() {
  4)   0.328 us    |          __calc_delta();
  4)   0.280 us    |          update_min_vruntime();
  4)   1.505 us    |        }
  4)   0.422 us    |        __update_load_avg_se();
  4)   0.332 us    |        __update_load_avg_cfs_rq();
  4)   0.284 us    |        clear_buddies();
  4)               |        update_cfs_group() {
  4)   0.309 us    |          reweight_entity();
  4)   0.876 us    |        }
  4)   0.293 us    |        update_min_vruntime();
  4)   5.538 us    |      }
  4)   0.282 us    |      hrtick_update();
  4) + 14.506 us   |    }
  4)               |    pick_next_task_fair() {
  4)               |      newidle_balance() {
  4)   0.276 us    |        __msecs_to_jiffies();
  4)   0.271 us    |        rcu_read_unlock_strict();
  4)   0.347 us    |        nohz_newidle_balance();
  4)   2.079 us    |      }
  4)   2.616 us    |    }
  4)               |    put_prev_task_fair() {
  4)               |      put_prev_entity() {
  4)   0.283 us    |        check_cfs_rq_runtime();
  4)   0.927 us    |      }
  4)               |      put_prev_entity() {
  4)   0.283 us    |        check_cfs_rq_runtime();
  4)   0.807 us    |      }
  4)   2.607 us    |    }
  4)               |    pick_next_task_idle() {
  4)               |      __update_idle_core() {
  4)   0.281 us    |        rcu_read_unlock_strict();
  4)   1.031 us    |      }
  4)   1.668 us    |    }
  4)   0.306 us    |    psi_task_switch();
  4)   0.897 us    |    __traceiter_sched_switch();
  4)   0.315 us    |    enter_lazy_tlb();
  4)   0.403 us    |    copy_fpregs_to_fpstate();
  0)   1.234 us    |  finish_task_switch.isra.0();
```

可以看到和 ftrace 很类似，但是这样的 输出很难看，可以 使用 `-m` 精简一下输出

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./funcgraph -m2 schedule
Tracing "schedule"... Ctrl-C to end.
  0)   1.265 us    |  file_ra_state_init();
  0)               |  schedule() {
  0)   0.308 us    |    rcu_note_context_switch();
  0)   0.177 us    |    _raw_spin_lock();
  0)   0.190 us    |    update_rq_clock();
  0)   1.267 us    |    psi_task_change();
  0)   3.115 us    |    dequeue_task_fair();
  0) + 16.366 us   |    pick_next_task_fair();
  0)   0.677 us    |    put_prev_task_fair();
  0)   0.520 us    |    pick_next_task_idle();
  0)   0.206 us    |    psi_task_switch();
  0)   0.550 us    |    __traceiter_sched_switch();
  0)   0.176 us    |    enter_lazy_tlb();
  0)   0.241 us    |    copy_fpregs_to_fpstate();
  9)   0.903 us    |    finish_task_switch.isra.0();
  9)   0.567 us    |    wq_worker_running();
  9) @ 103141.5 us |  } /* schedule */
```

可以看到 每个函数的耗费时间，比如这个例子中 可以看到 `pick_next_task_fair` 耗时较大，可以进一步分析


还可以使用 -p 来追踪制定 进程的目的



### kprobe

 dynamically trace a kernel function call or its return, with variables.
 与前面的工具不一样的是， kprobe 可以跟踪 return, 还有 内部variables。

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./kprobe p:do_sys_openat2
Tracing kprobe do_sys_openat2. Ctrl-C to end.
           <...>-1890130 [003] .... 1304707.196057: do_sys_openat2: (do_sys_openat2+0x0/0x150)
           <...>-1890130 [003] .... 1304707.196106: do_sys_openat2: (do_sys_openat2+0x0/0x150)
           <...>-1890130 [003] .... 1304707.196676: do_sys_openat2: (do_sys_openat2+0x0/0x150)
           <...>-1890130 [003] .... 1304707.196870: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252605: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252721: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252766: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252802: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252849: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252887: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.252930: do_sys_openat2: (do_sys_openat2+0x0/0x150)
            node-3706960 [008] .... 1304707.253007: do_sys_openat2: (do_sys_openat2+0x0/0x150)
^C
Ending tracing...
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```

The "p:" is for creating a probe. Use "r:" to probe the return of the function:
"p:" 是创建一个kprobe. "r:" 是创建一个kretprobe

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./kprobe r:do_sys_openat2
Tracing kprobe do_sys_openat2. Ctrl-C to end.
          kprobe-1892194 [007] .... 1305064.017143: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
           <...>-1892196 [009] .... 1305064.018585: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
           <...>-1892196 [009] .... 1305064.018633: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
           <...>-1892196 [009] .... 1305064.019216: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
           <...>-1892196 [009] .... 1305064.019410: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.032758: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.033256: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.033325: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.033363: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.033396: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.033428: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.034963: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-3706960 [004] .... 1305064.035047: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
            node-1358618 [000] .... 1305064.191464: do_sys_openat2: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2)
^C
Ending tracing...
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin#
```

`-H` 是 显示 headers

可以显示 返回值
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./kprobe 'r:myopen do_sys_openat2 $retval'
Tracing kprobe myopen. Ctrl-C to end.
          kprobe-1892927 [000] .... 1305161.519664: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
           <...>-1892933 [002] .... 1305161.520039: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
           <...>-1892933 [002] .... 1305161.520050: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
           <...>-1892933 [002] .... 1305161.520178: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
           <...>-1892933 [002] .... 1305161.520227: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
              sh-1892932 [010] .... 1305161.521214: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) arg1=0x3
```

'r:myopen do_sys_open $retval' 是一个 kprobe 定义，和 kernel 文档 `Documentation/trace/kprobetrace.txt` 里面定义的一样；
除了使用 probe 别名，还可以为参数提供任意名称。例如，将默认值"arg1"改为"rval":
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./kprobe 'r:myopen do_sys_openat2 ret=$retval'
Tracing kprobe myopen. Ctrl-C to end.
          kprobe-1894758 [009] .... 1305461.694802: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) ret=0x3
           <...>-1894760 [005] .... 1305461.696161: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) ret=0x3
            node-3706960 [006] .... 1305461.705250: myopen: (__x64_sys_openat+0x56/0x90 <- do_sys_openat2) ret=0x19
```


还可以trace 函数func的入口参数的值，比如
```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./kprobe 'p:myopen do_sys_openat2 filename=+0(%si):string'
Tracing kprobe myopen. Ctrl-C to end.
           <...>-1897778 [011] .... 1305798.993302: myopen: (do_sys_openat2+0x0/0x150) filename="/etc/ld.so.cache"
           <...>-1897778 [011] .... 1305798.993349: myopen: (do_sys_openat2+0x0/0x150) filename="/lib/x86_64-linux-gnu/libc.so.6"
           <...>-1897778 [011] .... 1305798.993863: myopen: (do_sys_openat2+0x0/0x150) filename="/usr/lib/locale/locale-archive"
           <...>-1897778 [011] .... 1305798.994040: myopen: (do_sys_openat2+0x0/0x150) filename="trace_pipe"
            node-3706960 [003] .... 1305799.184729: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/1452624/cmdline"
            node-3706960 [003] .... 1305799.184848: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/1368025/cmdline"
            node-3706960 [003] .... 1305799.186491: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/29675/cmdline"
            node-3706960 [003] .... 1305799.186586: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/660625/cmdline"
            node-3706960 [003] .... 1305799.186638: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/1368168/cmdline"
            node-3706960 [003] .... 1305799.186678: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/1368591/cmdline"
            node-3706960 [003] .... 1305799.186723: myopen: (do_sys_openat2+0x0/0x150) filename="/proc/1897776/cmdline"
^C
```

因为 `do_sys_openat2` 原型是：
```
static long do_sys_openat2(int dfd, const char __user *filename,
			   struct open_how *how)
{
	struct open_flags op;
	int fd = build_open_flags(how, &op);
	struct filename *tmp;
}
```
第二个参数是 filename，且类型是 char*, 根据 syscall 的约定，`man syscall` 可以看到：
```
  Arch/ABI      arg1  arg2  arg3  arg4  arg5  arg6  arg7  Notes
       ──────────────────────────────────────────────────────────────
       alpha         a0    a1    a2    a3    a4    a5    -
       arc           r0    r1    r2    r3    r4    r5    -
       arm/OABI      r0    r1    r2    r3    r4    r5    r6
       arm/EABI      r0    r1    r2    r3    r4    r5    r6
       arm64         x0    x1    x2    x3    x4    x5    -
      sparc/32      o0    o1    o2    o3    o4    o5    -
       sparc/64      o0    o1    o2    o3    o4    o5    -
       tile          R00   R01   R02   R03   R04   R05   -
       x86-64        rdi   rsi   rdx   r10   r8    r9    -
       x32           rdi   rsi   rdx   r10   r8    r9    -
       xtensa        a6    a3    a4    a5    a8    a9    -
```

在 x86-64 中，第二个参数存放在 rsi中。。
所以命令是 `kprobe 'p:myopen do_sys_openat2 filename=+0(%si):string'`

也可以通过 `-p` 指定特定进程来 做trace.

### uprobe
dynamically trace a user-level function call or its return, with variables.

```
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/perf-tools/bin# ./uprobe p:bash:readline
Tracing uprobe readline (p:readline /usr/bin/bash:0xd4950). Ctrl-C to end.
            bash-1452624 [003] d... 1306503.199858: readline: (0x55621dedf950)
            bash-1452624 [003] d... 1306503.443193: readline: (0x55621dedf950)
            bash-1452624 [003] d... 1306503.615018: readline: (0x55621dedf950)
            bash-1452624 [003] d... 1306503.772181: readline: (0x55621dedf950)
            bash-1452624 [003] d... 1306503.954737: readline: (0x55621dedf950)
            bash-1452624 [003] d... 1306505.194449: readline: (0x55621dedf950)
^C
Ending tracing...
```


### reset-ftrace
reset ftrace state if needed.




### tpoint

有较多语法需要学习。











参考[Linux Performance Analysis: New Tools and Old Secrets](https://www.usenix.org/conference/lisa14/conference-program/presentation/gregg)