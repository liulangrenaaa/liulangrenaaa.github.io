---
title: bpftrace
date: 2020-09-12 19:00:00
tags:
    - bpf
    - bpftrace
    - 性能稳定性
categories:
    - kernel debug
slug: "内核观测/bpf相关/bpftrace"
---


## bpf epbf bcc bpftrace 关系
### bpf 与 ebpf关系
BPF 是 Berkeley Packet Filter简称，现在也被称为cBPF(classic BPF)，要用于 tcpdump 和 seccomp，BPF早在1992 年就诞生了。

eBPF 是Enahnced Berkeley Packet Filter简称，诞生于2011年。
其实 eBPF 本身其实远没有想象中的复杂，我们可以把内核想象成一个庞大而复杂的电路，如果电路出现了异常，我们可以通过使用万用表测量电路，如果当前电路不能满足需求，但又不能推倒重新设计，我们需要串入其他元件。eBPF 之于电路，既是万用表，也是各种功能元件。再回到内核中的 eBPF，内核预先在各个关键路径埋设了 eBPF 程序入口，用户可以编写不同类型的 eBPF 程序，将 eBPF 程序 attach 在内核中不同路径中执行。

### bcc 与 ebpf
bcc 是 ebpf compile collection简称，是一个包含丰富的内核跟踪分析的 eBPF 工具集，使得 “编 写 BPF 代码-编译成字节码-注入内核-获取结果-展示” 整个过程更加便捷。

### bpftrace 与 ebpf
bpftrace 可以动态跟踪分析内核，bpftrace 提供了一种类 awk 和 C 的语言，使用 bpftrace 语言编写各种跟踪和分析脚本，并编译成 eBPF 字节码与内核交互，从而实现动态跟踪 Linux 内核。

总的来说bcc 和 bpftrace都是基于 ebpf特性实现的工具，实际使用中我发现bpftrace尤其好用相对于ftrace、perf等。后面会有相应的对比分析。

## bpftrace一行代码告诉你性能问题在哪
下面主要是 bpftrace 的一些使用方法

1. 列出所有探测点，并且可以添加搜索项，也可以管道传递给grep
```
"bpftrace -l"
```

2. 观察文件open事件
```
bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s %s\n", comm, str(args->filename)); }'
```

3. 进程系统调用数量统计
```
bpftrace -e 'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }'
```

4. read系统调用的分布
/xxx/: 可以过滤{}中执行的条件，一般可以是进程名，pid等
```
bpftrace -e 'tracepoint:syscalls:sys_exit_read /pid == 18644/ { @bytes = hist(args->ret); }'
```

5. 分析内核实时函数栈
profile:是采样
```
bpftrace -e 'profile:hz:99 { @[kstack] = count(); }'
```

6. 调度器跟踪

```
bpftrace -e 'tracepoint:sched:sched_switch { @[kstack] = count(); }'
```
具体有哪些参数变量可以使用，可以参考 `/sys/kernel/debug/tracing/events/` 里面具体某个跟踪项的 `format` 选项，里面列出了可以使用的变量，结构等
```
sh@ubuntu[root]:/sys/kernel/debug/tracing/events/sched/sched_switch# cat format
name: sched_switch
ID: 323
format:
        field:unsigned short common_type;       offset:0;       size:2; signed:0;
        field:unsigned char common_flags;       offset:2;       size:1; signed:0;
        field:unsigned char common_preempt_count;       offset:3;       size:1; signed:0;
        field:int common_pid;   offset:4;       size:4; signed:1;

        field:char prev_comm[16];       offset:8;       size:16;        signed:1;
        field:pid_t prev_pid;   offset:24;      size:4; signed:1;
        field:int prev_prio;    offset:28;      size:4; signed:1;
        field:long prev_state;  offset:32;      size:8; signed:1;
        field:char next_comm[16];       offset:40;      size:16;        signed:1;
        field:pid_t next_pid;   offset:56;      size:4; signed:1;
        field:int next_prio;    offset:60;      size:4; signed:1;

print fmt: "prev_comm=%s prev_pid=%d prev_prio=%d prev_state=%s%s ==> next_comm=%s next_pid=%d next_prio=%d", REC->prev_comm, REC->prev_pid, REC->prev_prio, (REC->prev_state & ((((0x0000 | 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040) + 1) << 1) - 1)) ? __print_flags(REC->prev_state & ((((0x0000 | 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040) + 1) << 1) - 1), "|", { 0x0001, "S" }, { 0x0002, "D" }, { 0x0004, "T" }, { 0x0008, "t" }, { 0x0010, "X" }, { 0x0020, "Z" }, { 0x0040, "P" }, { 0x0080, "I" }) : "R", REC->prev_state & (((0x0000 | 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040) + 1) << 1) ? "+" : "", REC->next_comm, REC->next_pid, REC->next_prio
sh@ubuntu[root]:/sys/kernel/debug/tracing/events/sched/sched_switch#
```

7. kprobes 跟踪
```
root@ubuntu-Inspiron-5548:~# bpftrace -e 'kprobe:do_sys_open {printf("[pid-%d:%s]: do_sys_open %s\n", pid,comm, str(arg1))}'
Attaching 1 probe...
[pid-42080:gsd-housekeepin]: do_sys_open /etc/fstab
[pid-42080:gsd-housekeepin]: do_sys_open /proc/self/mountinfo
[pid-42080:gsd-housekeepin]: do_sys_open /run/mount/utab
[pid-42080:gsd-housekeepin]: do_sys_open /proc/self/mountinfo
[pid-42080:gsd-housekeepin]: do_sys_open /run/mount/utab
^C
```

利用 kprobes 可以直接判断有没有执行到函数某一行，函数的参数等。
```
amd_server@ubuntu: ~/workspace/linux-stable/out# sudo bpftrace -e 'kretprobe:do_sys_open { printf("comm:%s, pid:%d, returned: %d\n", comm, pid ,retval)}'
 Attaching 1 probe...
comm:node, pid:4158123, returned: 24
comm:node, pid:4158123, returned: 24
```

bpftrace 跟踪某一个函数的执行栈
```
root@HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/linux-stable/kernel/sched# bpftrace -e 'kprobe:propagate_entity_cfs_rq { @[kstack(perf, 5)]=count(); }'
Attaching 1 probe...
^C

@[
        ffffffffa3d05bb1 propagate_entity_cfs_rq+1
        ffffffffa3d062ce migrate_task_rq_fair+270
        ffffffffa3cf7ba6 set_task_cpu+118
        ffffffffa3cf7cfb move_queued_task+59
        ffffffffa3cf8b5c migration_cpu_stop+684
]: 1
```

bpftrace 跟踪某一个函数的参数
```
bpftrace -e 'kprobe:vfs_open { printf("open path: %s\n", str(((struct path *)arg0)->dentry->d_name.name)); }'
Attaching 1 probe...
open path: meminfo
open path: cmdline
open path: vscode.lock
......
```

bpftrace 跟踪某一个函数的返回值
```

```



# bpftrace实战
搭建好 bpftrace 环境之后(bpftrace 工具安装 & vmlinux 符号安装查找),直接使用bpftrace 写脚本

给个例子
参考[eBPF on Android之bcc环境准备——eadb简版](https://blog.seeflower.dev/archives/138/)
```
11:17:36-ubuntu@vmware:/tmp $ cat 1234.bt 
#!/usr/bin/bpftrace

kprobe: kernfs_remove_by_name_ns
{
    printf("name=%s, comm=%s, pid=%d\n",
        str(arg1), comm, pid)

}
11:17:37-ubuntu@vmware:/tmp $ sudo ./1234.bt 
Attaching 1 probe...
name=rps_cpus, comm=kworker/u512:1, pid=144
name=rps_flow_cnt, comm=kworker/u512:1, pid=144
name=tx_timeout, comm=kworker/u512:1, pid=144
name=traffic_class, comm=kworker/u512:1, pid=144
name=xps_cpus, comm=kworker/u512:1, pid=144
name=xps_rxqs, comm=kworker/u512:1, pid=144
```



更多的需要去动手实践，在项目中灵活运用 `bpftrace` 这样的神器
更多资料可以参考：
[bpftrace的一行代码中文指引](https://github.com/iovisor/bpftrace/blob/master/docs/tutorial_one_liners_chinese.md)
[brendan大神的博客](http://www.brendangregg.com/ebpf.html)
[bpftrace官方guide](https://github.com/iovisor/bpftrace/blob/master/docs/reference_guide.md)
[宋宝华大师的总结](https://blog.csdn.net/21cnbao/article/details/95585483)

