---
title: ebpf
date: 2020-09-12 19:00:00
tags:
    - ebpf
categories:
    - kernel debug
---

# ebpf
ebpf 是类似于C语言的一种语言（bpf指令集规范），可以通过bcc编译成为 字节码， 然后通过 bpf加载器 在用户态程序调用 BPF() 系统调用注入kernel中， 注入kernel之后会先触发 bpf_check() 来verify一下，是否存在死循环 空指针等问题，避免内核崩溃等。

# 字节码什么时候执行？
uprobe, kprobe, tracepoint 等bpf程序挂载点触发的时候


# bpf虚拟机是什么？
主要包含 一个 JIT 编译器，一个指令解释器，
使能 JIT 编译器之后性能更高，会将BPF指令直接转换为 本地CPU指令之后保存下来

# ebpf 辅助函数
bpf code 不能直接使用kernel中的函数
bpf_get_current_pid_tgid();
bpf_get_current_comm();
bpf_get_ktime_ns();


# ebpf 执行字节码
___bpf_prog_run








# ebpf 编程

+ bpf指令集编程
+ bpfC编程
+ bpf前端编程

其中最推荐 bpf前端编程, 最简单其中又分为几个前端
1. BCC 难-可以做复杂功能, 提供框架用户接口,屏蔽加载编译复杂接口
2. bpftrace - 简单,都是一行程序可以搞定， 当然也可以像写shell一样写脚本bt文件
3. ply 编程

所以最推荐的还是 BCC(BPF compiler collection)








