---
title: 最简单的空指针oops
date: 2021-01-21 15:00:00
tags:
    - oops
    - panic
    - 空指针
categories:
    - linux内核
---

只是做一个记录，为了演示最简单的空指针case, 写了一个demo, 可以参考[github 代码](https://github.com/liulangrenaaa/test_modules/blob/main/null_pointer/01_null_pointer/01_null_pointer.c)

## 用 `crash` 分析
`insmod` 出错之后已经生成了相关 `dump`文件。
下面直接使用 `crash` 工具分析：

```
stable_kernel@kernel: /var/crash/202101211201# sudo crash vmlinux dump
crash 7.2.9++
GNU gdb (GDB) 7.6
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-unknown-linux-gnu"...
WARNING: kernel relocated [704MB]: patching 137170 gdb minimal_symbol values

      KERNEL: vmlinux
    DUMPFILE: dump.202101211201  [PARTIAL DUMP]
        CPUS: 4
        DATE: Thu Jan 21 12:00:56 CST 2021
      UPTIME: 00:12:53
LOAD AVERAGE: 0.16, 0.11, 0.10
       TASKS: 454
    NODENAME: rlk-Standard-PC-i440FX-PIIX-1996
     RELEASE: 5.11.0-rc4+
     VERSION: #5 SMP Wed Jan 20 20:41:47 CST 2021
     MACHINE: x86_64  (3692 Mhz)
      MEMORY: 2 GB
       PANIC: "Oops: 0002 [#1] SMP NOPTI" (check log for details)
         PID: 3605
     COMMAND: "krace_thread"
        TASK: ffffa1b006754b40  [THREAD_INFO: ffffa1b006754b40]
         CPU: 2
       STATE: TASK_RUNNING (PANIC)

crash>
```
可以看到 发生问题的 kernel 版本是 `5.11.0-rc4+`，编译时间是 `#5 SMP Wed Jan 20 20:41:47 CST 2021`，内存大小是 `2G`，出问题时刻的负载是`0.16, 0.11, 0.10`

PANIC 原因是`"Oops: 0002 [#1] SMP NOPTI" (check log for details)`，CPU:2 上的TASK（krace_thread-3605）: `ffffa1b006754b40`发生了 oops，具体原因需要看 日志来得到。



## `bt` 查看出问题的task
crash 运行之后默认的task是出问题的task，可以通过 `set` 查看
```
crash> set
    PID: 3605
COMMAND: "krace_thread"
   TASK: ffffa1b006754b40  [THREAD_INFO: ffffa1b006754b40]
    CPU: 2
  STATE: TASK_RUNNING (PANIC)
```

bt 可以查看当前追踪的task的 `backtrace`
```
crash> bt
PID: 3605   TASK: ffffa1b006754b40  CPU: 2   COMMAND: "krace_thread"
 #0 [ffffbbbf004ebc40] machine_kexec at ffffffffad04d87c
 #1 [ffffbbbf004ebc88] __crash_kexec at ffffffffad1283b8
 #2 [ffffbbbf004ebd50] crash_kexec at ffffffffad1290d0
 #3 [ffffbbbf004ebd60] oops_end at ffffffffad021d75
 #4 [ffffbbbf004ebd80] no_context at ffffffffad0570e0
 #5 [ffffbbbf004ebdf0] __bad_area_nosemaphore at ffffffffad0572c7
 #6 [ffffbbbf004ebe38] exc_page_fault at ffffffffadd16b67
 #7 [ffffbbbf004ebe60] asm_exc_page_fault at ffffffffade00ace
 #8 [ffffbbbf004ebee8] create_oops at ffffffffc0371027 [01_null_pointer]
 #9 [ffffbbbf004ebf10] kthread at ffffffffad0930da
#10 [ffffbbbf004ebf50] ret_from_fork at ffffffffad001ae2
```
`bt -c 1`： 可以查看 cpu:1 上当前运行的线程的backtrace
`bt -a`  ： 可以查看 当前所有 cpu上运行的线程的backtrace


这个case 十分显然，是 `create_oops` 这里出现了问题。

## dis 查看bug地址

`dis` 是 disassemble 反汇编的缩写，可以
1. 查看出问题 `text` 地址内容
2. 某个函数 `symbol` 符号内容
3. 某个函数 `symbol` 符号 + 偏移的内容
4. 某个符号 或者 `text` 与 代码行显示在一起（如果是`module` 中crash需要加载 module.ko）

```
crash> dis ffffffffc0371027
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
crash>
crash> dis create_oops
0xffffffffc0371000 <create_oops>:       mov    $0x1388,%edi
0xffffffffc0371005 <create_oops+5>:     callq  0xffffffffad104b80 <msleep>
0xffffffffc037100a <create_oops+10>:    mov    $0xffffffffc037203c,%rdi
0xffffffffc0371011 <create_oops+17>:    callq  0xffffffffadcc96da <printk>
0xffffffffc0371016 <create_oops+22>:    mov    $0x1388,%edi
0xffffffffc037101b <create_oops+27>:    callq  0xffffffffad104b80 <msleep>
0xffffffffc0371020 <create_oops+32>:    mov    $0xffffffffc037204f,%rdi
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
0xffffffffc0371032 <create_oops+50>:    callq  0xffffffffadcc96da <printk>
0xffffffffc0371037 <create_oops+55>:    xor    %eax,%eax
0xffffffffc0371039 <create_oops+57>:    retq
crash> dis create_oops+39
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
crash>
```

直接可以看出问题是，将立即数`$0x0` 赋值到 地址`0x0`中，所以直接 oops了
```
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
```


但是在哪一行呢，这就需要加载 ko文件了
```
crash> lsmod
     MODULE       NAME              SIZE  OBJECT FILE
ffffffffc0373000  01_null_pointer  16384  (not loaded)  [CONFIG_KALLSYMS]
crash>
crash>
crash> mod -s 01_null_pointer /tmp/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.ko
     MODULE       NAME              SIZE  OBJECT FILE
ffffffffc0373000  01_null_pointer  16384  /tmp/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.ko
crash>
crash> lsmod
     MODULE       NAME              SIZE  OBJECT FILE
ffffffffc0373000  01_null_pointer  16384  /tmp/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.ko
crash>
```

加载 ko文件之后，直接 `dis -l` 反汇编 出问题的函数
```
crash> dis -l create_oops
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 12
0xffffffffc0371000 <create_oops>:       mov    $0x1388,%edi
0xffffffffc0371005 <create_oops+5>:     callq  0xffffffffad104b80 <msleep>
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 13
0xffffffffc037100a <create_oops+10>:    mov    $0xffffffffc037203c,%rdi
0xffffffffc0371011 <create_oops+17>:    callq  0xffffffffadcc96da <printk>
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 14
0xffffffffc0371016 <create_oops+22>:    mov    $0x1388,%edi
0xffffffffc037101b <create_oops+27>:    callq  0xffffffffad104b80 <msleep>
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 16
0xffffffffc0371020 <create_oops+32>:    mov    $0xffffffffc037204f,%rdi
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 17
0xffffffffc0371032 <create_oops+50>:    callq  0xffffffffadcc96da <printk>
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 18
0xffffffffc0371037 <create_oops+55>:    xor    %eax,%eax
0xffffffffc0371039 <create_oops+57>:    retq
```

直接定位到
```
01_null_pointer.c: 16
0xffffffffc0371020 <create_oops+32>:    mov    $0xffffffffc037204f,%rdi
0xffffffffc0371027 <create_oops+39>:    movl   $0x0,0x0
```

代码中看看
```
	*(int *)0 = 0;
```

问题很快解决了。

## 试着查看x86 如何调用函数传参的

```
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 12
0xffffffffc0371000 <create_oops>:       mov    $0x1388,%edi
0xffffffffc0371005 <create_oops+5>:     callq  0xffffffffad104b80 <msleep>
```

对应代码是，`0x1388` 就是十六进制的 `5000`
```
	msleep(5000);
```
是不是第一个整形参数是存在 `edi` 寄存器中的


```
/home/ubuntu/workspace/share/test_modules/null_pointer/01_null_pointer/01_null_pointer.c: 13
0xffffffffc037100a <create_oops+10>:    mov    $0xffffffffc037203c,%rdi
0xffffffffc0371011 <create_oops+17>:    callq  0xffffffffadcc96da <printk>
```

对应的代码是
```
	printk("create_oops start\n");
```

`0xffffffffc037203c` 是啥呢？可以使用 `rd` 命令读取一下，原来是字符串的起始的地址
```
crash> rd 0xffffffffc037203c 4
ffffffffc037203c:  6f5f657461657263 726174732073706f   create_oops star
ffffffffc037204c:  7461657263000a74 652073706f6f5f65   t..create_oops e
crash>
```
是不是 第一个地址型参数是存放在 `rdi` 中的呢？

后面会用不同个数参数，不同类型参数的函数 crash，来实验一下这个是不是对～

找到[一篇讲解x86-64寄存器和函数调用的文章](https://zhuanlan.zhihu.com/p/27339191)，上面说的猜想就是扯淡。。














