---
title: perf基本使用
date: 2021-01-28 19:00:00
tags:
    - perf
categories:
    - kernel debug
---



arm64 版本perf编译
```
cd tools
make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- perf LDFLAGS+=--static
ls ./perf/ -al | grep perf
```
## perf功能
可以追踪 `tracepoint` `syscall` `kprobes`



### perf支持的 events
知道系统支持那些events，对遇到问题之后怎么分析十分有帮助。
```
perf list [--no-desc] [--long-desc]
        [hw|sw|cache|tracepoint|pmu|sdt|metric|metricgroup|event_glob]
```

看看支持的 `tracepoint`
```
Inspiron-5548@ubuntu: ~/workspace# sudo perf list tracepoint | wc -l
2591
Inspiron-5548@ubuntu: ~/workspace# sudo perf list tracepoint | grep "sched:"
  sched:sched_kthread_stop                           [Tracepoint event]
  sched:sched_kthread_stop_ret                       [Tracepoint event]
  sched:sched_migrate_task                           [Tracepoint event]
  sched:sched_move_numa                              [Tracepoint event]
  sched:sched_pi_setprio                             [Tracepoint event]
  sched:sched_process_exec                           [Tracepoint event]
```

看看支持的 `hw`
```
Inspiron-5548@ubuntu: ~/workspace# sudo perf list hw
List of pre-defined events (to be used in -e):
  branch-instructions OR branches                    [Hardware event]
  branch-misses                                      [Hardware event]
  bus-cycles                                         [Hardware event]
  cache-misses                                       [Hardware event]
  cache-references                                   [Hardware event]
  cpu-cycles OR cycles                               [Hardware event]
  instructions                                       [Hardware event]
  ref-cycles                                         [Hardware event]
```



### perf支持的选项
`-e` 事件选择器
`-p` 只跟踪制定线程
`-P` 采样周期，就是一共采样多久？
`-F` 频率，就是1s之内记录多少次
`-g` call_graph，打开调用栈追踪，火焰图就是利用的此特性
`-a` 从所有cpu搜集数据
`-D` 频率，就是1s之内记录多少次
`-G` 只采用 `cgroup` name内的信息
`-C` 指定CPU的数据

```
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# perf record  -e"sched:*"
^C[ perf record: Woken up 0 times to write data ]
[ perf record: Captured and wrote 1.503 MB perf.data (41 samples) ]
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# perf script
            perf 61734 [000] 203358.640055:          sched:sched_stat_runtime: comm=perf pid=61734 runtime=168226 [ns] vruntime=27117216697>
            perf 61734 [000] 203358.640059:                sched:sched_waking: comm=migration/0 pid=12 prio=0 target_cpu=000
            perf 61734 [000] 203358.640060:                sched:sched_wakeup: comm=migration/0 pid=12 prio=0 target_cpu=000
            perf 61734 [000] 203358.640061:          sched:sched_stat_runtime: comm=perf pid=61734 runtime=6351 [ns] vruntime=271172173327 >
            perf 61734 [000] 203358.640063:                sched:sched_switch: prev_comm=perf prev_pid=61734 prev_prio=120 prev_state=R+ ==>
     migration/0    12 [000] 203358.640066:          sched:sched_migrate_task: comm=perf pid=61734 prio=120 orig_cpu=0 dest_cpu=1
     migration/0    12 [000] 203358.640069: sched:sched_wake_idle_without_ipi: cpu=1
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# perf report
Available samples
0 sched:sched_kthread_stop                                                                                                                 ◆
0 sched:sched_kthread_stop_ret                                                                                                             ▒
5 sched:sched_waking                                                                                                                       ▒
5 sched:sched_wakeup                                                                                                                       ▒
0 sched:sched_wakeup_new                                                                                                                   ▒
13 sched:sched_switch                                                                                                                      ▒
4 sched:sched_migrate_task                                                                                                                 ▒
0 sched:sched_process_free
```


## perf sched的支持
可以用 `sudo perf sched` 看看perf sched的支持行为
```
Inspiron-5548@1ubuntu: ~/workspace# sudo perf sched
 Usage: perf sched [<options>] {record|latency|map|replay|script|timehist}
    -D, --dump-raw-trace  dump raw trace in ASCII
    -f, --force           don't complain, do it
    -i, --input <file>    input file name
    -v, --verbose         be more verbose (show symbol address, etc)
```


首先需要 `perf sched record`
```
Inspiron-5548@141ubuntu: ~/workspace# sudo perf sched record
^C[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 1.924 MB perf.data (4820 samples) ]

Inspiron-5548@130ubuntu: ~/workspace#
```
后续可以使用 `latency`  `map`  `replay`  `script` `timehist` 去分析

### 调度延迟
如果想分析调度延迟，可以制定按照进程还是线程来分析，也可以按照 `sudo perf sched latency --sort max` 找到最大调度延迟的task.
```
Inspiron-5548@ubuntu: ~/workspace# sudo perf sched latency --help
 Usage: perf sched latency [<options>]
    -C, --CPU <n>         CPU to profile on
    -p, --pids            latency stats per pid instead of per comm
    -s, --sort <key[,key2...]>
                          sort by key(s): runtime, switch, avg, max
```

```
Inspiron-5548@129ubuntu: ~/workspace# sudo perf sched latency --sort max

 -----------------------------------------------------------------------------------------------------------------
  Task                  |   Runtime ms  | Switches | Average delay ms | Maximum delay ms | Maximum delay at       |
 -----------------------------------------------------------------------------------------------------------------
  ibus-extension-:44142 |      0.053 ms |        1 | avg:    0.788 ms | max:    0.788 ms | max at: 189462.300642 s
  ibus-x11:44144        |      0.054 ms |        1 | avg:    0.743 ms | max:    0.743 ms | max at: 189462.300589 s
  kworker/3:1-eve:48187 |      2.245 ms |      107 | avg:    0.024 ms | max:    0.666 ms | max at: 189459.728139 s
  chrome:(4)            |     50.852 ms |      127 | avg:    0.021 ms | max:    0.645 ms | max at: 189462.300483 s
  JS Helper:(4)         |      2.367 ms |       25 | avg:    0.046 ms | max:    0.626 ms | max at: 189462.300654 s
  gsd-wacom:42110       |      0.063 ms |        1 | avg:    0.481 ms | max:    0.481 ms | max at: 189462.300409 s
  kworker/0:1-eve:48272 |      5.959 ms |       95 | avg:    0.024 ms | max:    0.456 ms | max at: 189462.343798 s
```

```
Inspiron-5548@130ubuntu: ~/workspace# sudo perf sched latency --sort switch
 -----------------------------------------------------------------------------------------------------------------
  Task                  |   Runtime ms  | Switches | Average delay ms | Maximum delay ms | Maximum delay at       |
 -----------------------------------------------------------------------------------------------------------------
  kworker/1:1-eve:44912 |      5.260 ms |      166 | avg:    0.019 ms | max:    0.141 ms | max at: 189461.969262 s
  chrome:(4)            |     50.852 ms |      127 | avg:    0.021 ms | max:    0.645 ms | max at: 189462.300483 s
  kworker/3:1-eve:48187 |      2.245 ms |      107 | avg:    0.024 ms | max:    0.666 ms | max at: 189459.728139 s
  kworker/0:1-eve:48272 |      5.959 ms |       95 | avg:    0.024 ms | max:    0.456 ms | max at: 189462.343798 s
```

### 调度行为详细分析
可以使用 `sudo perf sched script` 具体分析 线程何时 wakeup，何时 switch 等信息

```
Inspiron-5548@141ubuntu: ~/workspace# sudo perf sched script
            perf 50314 [000] 189458.979541: sched:sched_stat_runtime: comm=perf pid=50314 runtime=41043 [ns] vruntime=46286470740 [ns]
            perf 50314 [000] 189458.979545:       sched:sched_wakeup: comm=migration/0 pid=12 prio=0 target_cpu=000
            perf 50314 [000] 189458.979546: sched:sched_stat_runtime: comm=perf pid=50314 runtime=4675 [ns] vruntime=46286475415 [ns]
            perf 50314 [000] 189458.979547:       sched:sched_switch: prev_comm=perf prev_pid=50314 prev_prio=120 prev_state=R+ ==> next_co>
     migration/0    12 [000] 189458.979551: sched:sched_migrate_task: comm=perf pid=50314 prio=120 orig_cpu=0 dest_cpu=1
     migration/0    12 [000] 189458.979570:       sched:sched_switch: prev_comm=migration/0 prev_pid=12 prev_prio=0 prev_state=S ==> next_c>
         swapper     0 [001] 189459.531154:       sched:sched_switch: prev_comm=swapper/1 prev_pid=0 prev_prio=120 prev_state=R ==> next_co>
          chrome 44220 [001] 189459.531182: sched:sched_stat_runtime: comm=chrome pid=44220 runtime=33768 [ns] vruntime=358082171091 [ns]
          chrome 44220 [001] 189459.531184:       sched:sched_switch: prev_comm=chrome prev_pid=44220 prev_prio=120 prev_state=S ==> next_c>
            Xorg 41740 [002] 189459.531198:       sched:sched_wakeup: comm=chrome pid=44220 prio=120 target_cpu=001
         swapper     0 [001] 189459.531202:       sched:sched_switch: prev_comm=swapper/1 prev_pid=0 prev_prio=120 prev_state=R ==> next_co>
            Xorg 41740 [002] 189459.531231: sched:sched_stat_runtime: comm=Xorg pid=41740 runtime=566128 [ns] vruntime=22634838876 [ns]
            Xorg 41740 [002] 189459.531234:       sched:sched_switch: prev_comm=Xorg prev_pid=41740 prev_prio=120 prev_state=S ==> next_com>
          chrome 44220 [001] 189459.531296: sched:sched_stat_runtime: comm=chrome pid=44220 runtime=98522 [ns] vruntime=358082269613 [ns]
          chrome 44220 [001] 189459.531299:       sched:sched_switch: prev_comm=chrome prev_pid=44220 prev_prio=120 prev_state=S ==> next_c>
         swapper     0 [001] 189459.537012:       sched:sched_wakeup: comm=kworker/1:1 pid=44912 prio=120 target_cpu=001
         swapper     0 [001] 189459.537019:       sched:sched_switch: prev_comm=swapper/1 prev_pid=0 prev_prio=120 prev_state=R ==> next_co>
         swapper     0 [000] 189459.537022:       sched:sched_wakeup: comm=kworker/0:1 pid=48272 prio=120 target_cpu=000
```

### 调度延迟可能原因
1. 唤醒线程的 `target cpu` 上正在运行的线程的 `vruntime`与 唤醒线程的 `vruntime` 差值较小，导致调度器，认为不能切换。

2. 唤醒线程的 `target cpu` 上当前正在运行的线程已运行的时间还小于最小运行时间（sched_min_granularity_ns），为防止切换太频繁，所以调度器认为u不能切换线程；

3. 唤醒抢占的feature关闭，即sched_features中WAKEUP_PREEMPT特性关闭，不允许唤醒抢占

4. 唤醒线程的 `target cpu` 被hard irq占用较多，导致无法进行 `sched_switch`

5. 唤醒线程的 `target cpu` 被 softirq占用较多（net soft_irq）。

6. 唤醒线程的 `target cpu`， cpu上唤醒的线程实在太多，唤醒的线程在 rbtree上不是最左边的线程。

7. 非抢占内核上， 唤醒线程的 `target cpu` 上正在运行的线程一直处于内核态(有bug)，导致一直未退出到用户空间，所以一直不能切换？




## perf 对动态追踪的支持
上面的`sudo perf list tracepoint` `sudo perf sched record` 都是基于 `static tracepoint`的，假如我想追踪一个函数，但是没有相关的 `static tracepoint`点，应该如何做呢？

perf 提供了 `sudo perf probe` 的方法

### 动态添加删除 probe点
`sudo perf probe --add 'xxx'` 添加
`sudo perf probe -d 'xxx'` 删除
`sudo perf probe --list` 展示
`sudo perf record -e probe:xxx -aR sleep 5` 采样这个 probe 5s.
`sudo perf record -e probe:xxx -aR slep5 --filter 'yy'` 采样这个 probe 5s，且满足yyy条件
```
Inspiron-5548@ubuntu: ~/workspace# sudo perf probe --add tcp_sendmsg
Added new event:
  probe:tcp_sendmsg    (on tcp_sendmsg)

You can now use it in all perf tools, such as:

	perf record -e probe:tcp_sendmsg -aR sleep 1

Inspiron-5548@ubuntu: ~/workspace# sudo perf probe --list

  probe:tcp_sendmsg    (on tcp_sendmsg)
Inspiron-5548@ubuntu: ~/workspace# sudo perf probe -d tcp_sendmsg

Removed event: probe:tcp_sendmsg
Inspiron-5548@ubuntu: ~/workspace# sudo perf probe --list

Inspiron-5548@ubuntu: ~/workspace#
```


`add`添加的时候也可以加上表达式，然后在`record`，在最后`script` 解析时，会自动打印
```
Inspiron-5548@130ubuntu: ~/workspace# sudo perf probe --add 'tcp_sendmsg bytes=%cx'
Added new event:
  probe:tcp_sendmsg    (on tcp_sendmsg with bytes=%cx)

You can now use it in all perf tools, such as:

	perf record -e probe:tcp_sendmsg -aR sleep 1

Inspiron-5548@ubuntu: ~/workspace# sudo perf record -e probe:tcp_sendmsg -aR sleep 5
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 1.396 MB perf.data (10 samples) ]
Inspiron-5548@ubuntu: ~/workspace# sudo perf script
             ssh 59966 [001] 199745.500983: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b347ee268
            code 50459 [000] 199745.501228: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae910
             ssh 59966 [001] 199746.651139: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b347ee268
            code 50459 [000] 199746.651380: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae910
            code 50432 [003] 199747.361044: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae600
            code 50459 [000] 199747.361322: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae910
             ssh 59966 [001] 199747.361489: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b347ee268
            code 50432 [000] 199748.724615: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae600
            code 50459 [001] 199748.724872: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b346ae910
             ssh 59966 [002] 199748.725028: probe:tcp_sendmsg: (ffffffff8ac617a0) bytes=0xffff970b347ee268
Inspiron-5548@ubuntu: ~/workspace#
```


关于%ax %bx %cx解释
```
PROBE ARGUMENT
       Each probe argument follows below syntax.

           [NAME=]LOCALVAR|$retval|%REG|@SYMBOL[:TYPE][@user]

       NAME specifies the name of this argument (optional). You can use the name of local variable, local data structure member (e.g.
       var→field, var.field2), local array with fixed index (e.g. array[1], var→array[0], var→pointer[2]), or kprobe-tracer argument
       format (e.g. $retval, %ax, etc). Note that the name of this argument will be set as the last member name if you specify a local
       data structure member (e.g. field2 for var→field1.field2.) $vars and $params special arguments are also available for NAME, $vars
       is expanded to the local variables (including function parameters) which can access at given probe point. $params is expanded to
       only the function parameters. TYPE casts the type of this argument (optional). If omitted, perf probe automatically set the type
       based on debuginfo (*). Currently, basic types (u8/u16/u32/u64/s8/s16/s32/s64), hexadecimal integers (x/x8/x16/x32/x64),
       signedness casting (u/s), "string" and bitfield are supported. (see TYPES for detail) On x86 systems %REG is always the short
       form of the register: for example %AX. %RAX or %EAX is not valid. "@user" is a special attribute which means the LOCALVAR will be
       treated as a user-space memory. This is only valid for kprobe event.
```


## perf ftrace 的使用
man 手册
```
perf ftrace --help
PERF-FTRACE(1)                                                             perf Manual                                                             PERF-FTRACE(1)

NAME
       perf-ftrace - simple wrapper for kernel's ftrace functionality

SYNOPSIS
       perf ftrace <command>

DESCRIPTION
       The perf ftrace command is a simple wrapper of kernel’s ftrace functionality. It only supports single thread tracing currently and just reads trace_pipe
       in text and then write it to stdout.

       The following options apply to perf ftrace.

OPTIONS
       -t, --tracer=
           Tracer to use when neither -G nor -F option is not specified: function_graph or function.

       -v, --verbose=
           Verbosity level.

       -F, --funcs
           List available functions to trace. It accepts a pattern to only list interested functions.

```

查看有哪些函数可以用于跟踪
```
ubuntu@zeku_server:~/workspace/share/test_modules $ sudo perf ftrace -F | grep vfs_read
vfs_read
vfs_readv
vfs_readlink
ubuntu@zeku_server:~/workspace/share/test_modules $
```

用于跟踪 graph-ftrace
```
ubuntu@zeku_server:~/workspace/share/test_modules $ sudo perf ftrace -a -G vfs_read
# tracer: function_graph
#
# CPU  DURATION                  FUNCTION CALLS
# |     |   |                     |   |   |   |
  3)               |  vfs_read() {
  3)               |    rw_verify_area() {
  3)               |      security_file_permission() {
  3)               |        apparmor_file_permission() {
  3)               |          aa_file_perm() {
  3)   0.102 us    |            rcu_read_unlock_strict();
  3)   0.321 us    |          }
  3)   0.508 us    |        }
  3)   0.095 us    |        __fsnotify_parent();
  3)   0.900 us    |      }
  3)   1.130 us    |    }
  3)               |    new_sync_read() {
  3)               |      ext4_file_read_iter() {
  3)               |        generic_file_read_iter() {
  3)               |          generic_file_buffered_read() {
  3)               |            _cond_resched() {
  3)   0.086 us    |              rcu_all_qs();
  3)   0.255 us    |            }
  3)               |            generic_file_buffered_read_get_pages() {
  3)               |              find_get_pages_contig() {
  3)   0.088 us    |                PageHuge();
  3)   0.084 us    |                rcu_read_unlock_strict();
  3)   0.566 us    |              }
  3)   0.747 us    |            }
  3)   0.191 us    |            mark_page_accessed();
  3)               |            _cond_resched() {
  3)   0.214 us    |              rcu_all_qs();
  3)   0.646 us    |            }
  3)               |            touch_atime() {
  3)               |              atime_needs_update() {
  3)               |                current_time() {
  3)   0.084 us    |                  ktime_get_coarse_real_ts64();
  3)   0.266 us    |                }
  3)   0.435 us    |              }
  3)   0.607 us    |            }
  3)   3.294 us    |          }
  3)   3.486 us    |        }
  3)   3.659 us    |      }
  3)   3.873 us    |    }
  3)   0.088 us    |    __fsnotify_parent();
  3)   5.884 us    |  }
  3)               |  vfs_read() {
```


## perf lock 的使用
为了给系统中造成一定压力，先 起10个 vm thread 分配内存
```
stable_kernel@kernel: ~/workspace/fs# stress --vm 10
stress: info: [4746] dispatching hogs: 0 cpu, 0 io, 10 vm, 0 hdd
```

```
stable_kernel@kernel: ~/workspace/linux/tools/perf# sudo ./perf lock record
^C[ perf record: Woken up 0 times to write data ]
Warning:
Processed 301597 events and lost 4 chunks!

Check IO/CPU overload!

[ perf record: Captured and wrote 30.069 MB perf.data (295337 samples) ]

stable_kernel@130kernel: ~/workspace/linux/tools/perf# sudo ./perf lock report
               Name   acquired  contended   avg wait (ns) total wait (ns)   max wait (ns)   min wait (ns)

       rcu_read_lock     884617          0               0               0               0               0
      &mm->mmap_lock       9652          0               0               0               0               0
      &mm->mmap_lock       8229          0               0               0               0               0
      &mm->mmap_lock       7863          0               0               0               0               0
      &mm->mmap_lock       7827          0               0               0               0               0
      &mm->mmap_lock       7782          0               0               0               0               0
      &mm->mmap_lock       7549          0               0               0               0               0
      &mm->mmap_lock       7364          0               0               0               0               0
      &mm->mmap_lock       6710          0               0               0               0               0
      &mm->mmap_lock       6676          0               0               0               0               0
        &xa->xa_lock       5485        171            1075          183872            4457             705
      &mm->mmap_lock       5482          0               0               0               0               0
 hrtimer_bases.lo...       1160          0               0               0               0               0
 hrtimer_bases.lo...       1146          0               0               0               0               0
 hrtimer_bases.lo...       1119          0               0               0               0               0
 hrtimer_bases.lo...       1118          0               0               0               0               0
         &zone->lock        975          6            2009           12054            3671             805
 ptlock_ptr(page)...        966          0               0               0               0               0
 ptlock_ptr(page)...        933          0               0               0               0               0
```
可以看到这种 `memory` 压力比较大的情况下，`xa->xa_lock` 与 `zone->lock` 的争用情况比较激烈
+ Name：内核锁的名字。
+ aquired：该锁被直接获得的次数，因为没有其它内核路径占用该锁，此时不用等待。
+ contended：该锁等待后获得的次数，此时被其它内核路径占用，需要等待。
+ total wait：为了获得该锁，总共的等待时间。
+ max wait：为了获得该锁，最大的等待时间。
+ min wait：为了获得该锁，最小的等待时间



## perf 的 overhead
为了对比明显，这里加上`strace` 对比，由于strace 会使用ptrace（2）附加到目标进程，并在系统调用期间将其停止，例如调试器。 这很猛烈，并可能导致严重的开销。为了证明这一点，下面的系统调用繁重程序是通过perf和strace本身运行的。

```
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# dd if=/dev/zero of=/dev/null bs=512 count=10000k
记录了10240000+0 的读入
记录了10240000+0 的写出
5242880000 bytes (5.2 GB, 4.9 GiB) copied, 14.3584 s, 365 MB/s
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# perf stat -e 'syscalls:sys_enter_*' dd if=/dev/zero of=/dev/null bs=512 count=10000k
记录了10240000+0 的读入
记录了10240000+0 的写出
5242880000 bytes (5.2 GB, 4.9 GiB) copied, 15.4485 s, 339 MB/s
root@ubuntu-Inspiron-5548:/home/ubuntu/workspace# strace -c dd if=/dev/zero of=/dev/null bs=512 count=10000k
	记录了10240000+0 的读入
记录了10240000+0 的写出
5242880000 bytes (5.2 GB, 4.9 GiB) copied, 504.601 s, 10.4 MB/s
```
perf 慢了1MB/s大概7%，但是strace慢了36倍。。
与 `strace` 这类会停止线程的debugger方式比， perf的 overhead 就显得微不足道了。





















参考[博客](https://blog.yadutaf.fr/)
参考[perf example]](http://www.brendangregg.com/perf.html)
