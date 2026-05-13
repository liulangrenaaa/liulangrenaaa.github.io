---
title: How to Use system Tap
date: 2021-01-09 10:00:40
tags:
    - systemTap
categories:
    - linux内核
---

SystemTap允许使用者监控Linux系统当前的运行情况，以便进一步分析。这将有助于运维或开发人员缉查bug或性能问题的罪魁祸首。
SystemTap提供了一门领域特定语言，使得用户可以编写自定义脚本，调查和监控各种内核函数、系统调用，
和其它发生在内核空间的事件。

就此而言，SystemTap不仅仅是个工具，它是一个让你能够自定义内核取证和监控工具的生态系统。

当前版本的SystemTap提供的探测内核空间事件的众多选项，可以在不同版本的内核下使用。
然而，SystemTap对探测用户空间事件的支持依赖于内核的支持（需要uprobe机制），而多数内核缺乏这一支持。
结果是，仅有部分内核上的SystemTap版本支持用户空间探测。

## 安装SystemTap
安装 systemtap 软件
```
Inspiron-5548@ubuntu: /var/crash# sudo apt install systemtap
Inspiron-5548@ubuntu: /var/crash# sudo apt install systemtap-runtime
```

安装 kernel debug info
```
Inspiron-5548@ubuntu: /var/crash# sudo apt install systemtap
Inspiron-5548@ubuntu: /var/crash# sudo apt install systemtap-runtime
```
## SystemTap 可以用来干什么

SystemTap允许用户仅需编写和重用简单的脚本即可获取Linux繁多的运行数据。通过SystemTap脚本，
你可以又好又快地提取数据、过滤数据、汇总数据。诊断复杂的性能问题（或功能问题）再也不是难事。
整个SystemTap脚本所做的，无非就是声明感兴趣的事件，然后添加对应的处理程序。当SystemTap脚本运行时，SystemTap会监控声明的事件；
一旦事件发生，Linux内核会临时切换到对应的处理程序，完成后再重拾原先的工作。

```
可供监控的事件种类繁多：进入/退出某个函数，定时器到期，会话终止，等等。处理程序由一组SystemTap语句构成，指明事件发生后要做的工作。
其中包括从事件上下文中提取数据，存储到内部变量中，输出结果。
```

## SystemTap 使用

### 最简单的一行代码

```
Inspiron-5548@127ubuntu: ~/workspace# echo "probe timer.s(1) {exit()}" | sudo stap -v -

Pass 1: parsed user script and 476 library scripts using 108312virt/90968res/7440shr/83392data kb, in 260usr/30sys/315real ms.
Pass 2: analyzed script: 1 probe, 1 function, 0 embeds, 0 globals using 109896virt/92776res/7688shr/84976data kb, in 10usr/0sys/9real ms.
Pass 3: translated to C into "/tmp/stappbkhvF/stap_629b1ee8abda600005ad17f270124c66_947_src.c" using 110032virt/92776res/7688shr/85112data kb, in 0usr/0sys/1real ms.
Pass 4: compiled C into "stap_629b1ee8abda600005ad17f270124c66_947.ko" in 15530usr/2160sys/17963real ms.
Pass 5: starting run.
Pass 5: run completed in 20usr/30sys/1459real ms.
Inspiron-5548@ubuntu: ~/workspace#
```
可以看出 SystemTap 脚本运行需要结果5个步骤，在加载 SystemTap脚本过程(生成ko)的时候，SystemTap 耗时较多，尤其是CPU资源。

SystemTap脚本运行时，会启动一个对应的SystemTap会话。整个会话大致流程如下：

首先，SystemTap会检查脚本中用到的tapset，确保它们都存在于tapset库中（通常是/usr/share/systemtap/tapset/）。然后SystemTap会把找到的tapset替换成在tapset库中对应的定义。
tapset是tap（听诊器）的集合，指一些预定义的SystemTap事件或函数。[完整的tapset列表](https://sourceware.org/systemtap/tapsets/)

SystemTap接着会把脚本转化成C代码，运行系统的C编译器编译出一个内核模块。完成这一步的工具包含在systemtap包中
SystemTap随即加载该模块，并启用脚本中所有的探针（包括事件和对应的处理程序）。这一步由system-runtime包的staprun完成。
每当被监控的事件发生，对应的处理程序就会被执行。
一旦SystemTap会话终止，探针会被禁用，内核模块也会被卸载。
这一串流程皆始于一个简单的命令行程序：stap。这个程序包揽了SystemTap主要的功能。


### 脚本如何编写

在大多数情况下，SystemTap脚本是每个SystemTap会话的基石。SystemTap脚本决定了需要收集的信息类型，也决定了对收集到的信息的处理方式。
SystemTap脚本由两部分组成：事件和处理程序。
一旦SystemTap会话准备就绪，SystemTap会监控操作系统中特定的事件，并在事件发生的时候触发对应的处理程序。
```
一个事件和它对应的处理程序合称探针。一个SystemTap脚本可以有多个探针。 一个探针的处理程序部分通常称之为探针主体（probe body）
```

与应用开发的方式类比，使用事件和处理程序就像在程序的特定位置插入打日志的语句。每当程序运行时，这些日志会帮助你查看程序执行的流程。
但是SystemTasp脚本允许你在无需重新编译代码，即可插入检测指令，而且处理程序也不限于单纯地打印数据。
事件会触发对应的处理程序；对应的处理程序记录下感兴趣的数据，并以你指定的格式输出。

SystemTap脚本的后缀是.stp，并以这样的语句表示一个探针：
```
probe   event {statements}
```

SystemTap支持给一个探针指定多个事件；每个事件以逗号隔开。
如果给某一个探针指定了多个事件，只要其中一个事件发生，SystemTap就会执行对应的处理程序。
每个探针有自己对应的语句块。语句块由花括号 {} 括住，包含事件发生时需要执行的所有语句。
SystemTap会顺序执行这些语句；语句间通常不需要特殊的分隔符或终止符。

SystemTap还允许你编写函数来提取探针间公共的逻辑。
所以，与其在多个探针间复制粘贴重复的语句，你不如把它们放入函数中，就像函数调用一样：

```
function function_name(arguments) {statements}

probe event {function_name(arguments)}
```
当探针被触发时，function_name中的语句会被执行。arguments是传递给函数的可选的入参。

### SystemTap 事件

我们还需要了解SystemTap 事件，这里主要分为 `同步事件` 和 `异步事件`。

#### 同步事件
同步事件会在任意进程执行到内核特定位置时触发。你可以用它来作为其它事件的参照点，毕竟同步事件有着清晰的上下文信息。
包括：

`syscall.system_call`

进入名为system_call的系统调用。如果想要监控的是退出某个系统调用的事件，在后面添加.return。举个例子，要想监控进入和退出系统调用close的事件，应该使用syscall.close和syscall.close.return。

`vfs.file_operation`

进入虚拟文件系统（VFS）名为file_operation的文件操作。跟系统调用事件一样，在后面添加.return可以监控对应的退出事件。 译注：file_operation取值的范畴，取决于当前内核中struct file_operations的定义的操作.


`kernel.function("function")`

进入名为function的内核函数。举个例子，kernel.function("sys_open")即内核函数sys_open被调用时所触发的事件。同样，kernel.function("sys_open").return会在sys_open函数调用返回时被触发。

在定义探测事件时，可以使用像*这样的通配符。你也可以用内核源码文件名限定要跟踪的函数。看下面的例子：

```
probe kernel.function("*@net/socket.c") { }
probe kernel.function("*@net/socket.c").return { }
```


`kernel.trace("tracepoint")`
到达名为tracepoint的静态内核探测点（tracepoint）。较新的内核（>= 2.6.30）包含了特定事件的检测代码。这些事件一般会被标记成静态内核探测点。一个例子是，kernel.trace("kfree_skb")表示内核释放了一个网络缓冲区的事件。（译注：想知道当前内核设置了哪些静态内核探测点吗？你需要运行sudo perf list。）



`module("module").function("function")`

进入指定模块module的函数function。举个例子：

```
probe module("ext3").function("*") { }
probe module("ext3").function("*").return { }
```

#### 异步事件

异步事件跟特定的指令或代码的位置无关。 这部分事件主要包含计数器、定时器和其它类似的东西。

`begin`

SystemTap会话的启动事件，会在脚本开始时触发。


`end`

SystemTap会话的结束事件，会在脚本结束时触发。

`timer events`

用于周期性执行某段处理程序。举个例子：

```
probe timer.s(4) { printf("hello world\n") }
```

上面的例子中，每隔4秒就会输出hello world。还可以使用其它规格的定时器：

```
timer.ms(milliseconds)
timer.us(microseconds)
timer.ns(nanoseconds)
timer.hz(hertz)
timer.jiffies(jiffies)
```

定时事件总是跟其它事件搭配使用。其它事件负责收集信息，而定时事件定期输出当前状况，让你看到数据随时间的变化情况。



### SystemTap 处理程序

有了事件之后，我们还需要在事件发生之后进行处理。

example1:
```
probe begin
{
  printf ("hello world\n")
  exit ()
}
```
SystemTap脚本会一直运行，直到执行了exit()函数。如果你想中途退出一个脚本，可以用Ctrl+c中断。
这是一个异步事件 `begin` 之后开始打印 一个字符串.

`printf` 是一个标准输出函数

```
printf ("format string\n", arguments)
```


example2:
```
probe syscall.open
{
  printf ("%s(%d) open\n", execname(), pid())
}

echo ' probe syscall.open {  printf ("%s(%d) open\n", execname(), pid()) }' | sudo stap -v -
```
example2中 SystemTap会在每次open被调用时，输出调用程序的名字和PID。

该探针输出的结果看上去会是这样(not in zsh, in bash)：
```
ubuntu@ubuntu-Inspiron-5548:~/workspace$ echo ' probe syscall.open {  printf ("%s(%d) open\n", execname(), pid()) }' | sudo stap -v -
Pass 1: parsed user script and 476 library scripts using 108308virt/90696res/7172shr/83388data kb, in 290usr/40sys/364real ms.
Pass 2: analyzed script: 4 probes, 5 functions, 97 embeds, 4 globals using 110292virt/93060res/7724shr/85372data kb, in 230usr/330sys/575real
 ms.
Pass 3: using cached /root/.systemtap/cache/4c/stap_4cd2c557b5457e5f955c640275432033_64778.c
Pass 4: using cached /root/.systemtap/cache/4c/stap_4cd2c557b5457e5f955c640275432033_64778.ko
Pass 5: starting run.
rg(25671) open
rg(25671) open
rg(25671) open
rg(25671) open
rg(25671) open
```

下面是常用的 SystemTap 内建函数：

`tid()`

当前的tid（thread id）。

`uid()`

当前的uid。

`cpu()`

当前的CPU号

`gettimeofday_s()`

自epoch以来的秒数

`ctime()`

将上一个函数返回的秒数转化成时间字符串

`pp()`

返回描述当前处理的探测点的字符串

`thread_indent()`


`name`

返回系统调用的名字。这个变量只能在syscall.system_call触发的处理程序中使用。

`target()`

当你通过stap script -x PID或stap script -c command来执行某个脚本script时，target()会返回你指定的PID或命令名。举个例子：
```
probe syscall.* {
  if (pid() == target())
    printf("%s\n", name)
}

echo ' probe syscall.* { if (pid() == target()) printf("%s\n", name) }' | sudo stap -v -
```
这个 SystemTap 脚本使用了通配符 probe了所以系统调用，在对脚本解析，编译成为 kernel module ko的时候尤其耗时，
在我 I5 5200U的机器上居然准备工作做了进1min...

```
top - 12:38:07 up 12:53,  2 users,  load average: 2.56, 1.77, 1.14
任务: 277 total,   5 running, 271 sleeping,   0 stopped,   1 zombie
%Cpu(s): 10.0 us, 17.6 sy,  0.0 ni, 66.9 id,  0.0 wa,  0.0 hi,  5.5 si,  0.0 st
MiB Mem :   3658.2 total,    196.4 free,   2043.1 used,   1418.8 buff/cache
MiB Swap:   2048.0 total,   1572.1 free,    475.9 used.    986.8 avail Mem

 进程号 USER      PR  NI    VIRT    RES    SHR    %CPU  %MEM     TIME+ COMMAND
  54775 root      20   0  171592 154320  18248 R  99.7   4.1   1:05.72 stap
    932 ubuntu    20   0 1750472  40364  14900 S   3.7   1.1  11:16.15 Xorg
   1279 ubuntu    20   0 4777288 218332  57988 S   3.0   5.8  12:57.76 gnome-shell
   2458 ubuntu    20   0 4633228 103048  65556 R   3.0   2.8   0:10.23 chrome
   1747 ubuntu    20   0  987308  43280  31604 S   1.7   1.2   0:46.33 gnome-terminal-
   2371 ubuntu    20   0 1342876 232676  99800 S   0.7   6.2   8:23.72 chrome
     18 root      20   0       0      0      0 S   0.3   0.0   0:01.14 ksoftirqd/1
     30 root      20   0       0      0      0 S   0.3   0.0   0:00.87 ksoftirqd/3
Inspiron-5548@ubuntu: ~/workspace/linux-stable/drivers#
```
输出是

```
ubuntu@ubuntu-Inspiron-5548:~/workspace$ echo ' probe syscall.* { if (pid() == target()) printf("%s\n", name) }' | sudo stap -v -x 2371 -
Pass 1: parsed user script and 476 library scripts using 108312virt/90872res/7344shr/83392data kb, in 510usr/40sys/559real ms.
qWARNING: cross-file global variable reference to identifier 'syscall_string_trunc' at /usr/share/systemtap/tapset/linux/syscalls_cfg_trunc.s
tp:3:8 from: identifier 'syscall_string_trunc' at /usr/share/systemtap/tapset/linux/sysc_add_key.stp:19:59
 source:                         user_buffer_quoted(payload_uaddr, plen, syscall_string_trunc),
                                                                         ^
        in expansion of macro: operator '@_SYSCALL_ADD_KEY_ARGSTR' at /usr/share/systemtap/tapset/linux/sysc_add_key.stp:72:2
 source:        @_SYSCALL_ADD_KEY_ARGSTR
                ^
WARNING: cross-file global variable reference to identifier 'syscall_string_trunc' at /usr/share/systemtap/tapset/linux/syscalls_cfg_trunc.st
p:3:8 from: identifier 'syscall_string_trunc' at /usr/share/systemtap/tapset/linux/sysc_mount.stp:31:46
 source:        data = user_string_n_quoted(pointer_arg(5), syscall_string_trunc)
                                                            ^
WARNING: cross-file global variable reference to identifier 'syscall_string_trunc' at /usr/share/systemtap/tapset/linux/syscalls_cfg_trunc.st
p:3:8 from: identifier 'syscall_string_trunc' at :23:49
 source:        buf_str = user_buffer_quoted(buf_uaddr, count, syscall_string_trunc)
                                                               ^
        in expansion of macro: operator '@_SYSCALL_WRITE_REGARGS' at /usr/share/systemtap/tapset/linux/sysc_write.stp:100:2
 source:        @_SYSCALL_WRITE_REGARGS
                ^
Pass 2: analyzed script: 853 probes, 29 functions, 100 embeds, 5 globals using 129252virt/113636res/9172shr/104332data kb, in 35560usr/79740s
ys/116322real ms.
Pass 3: using cached /root/.systemtap/cache/e2/stap_e2b35608bd8c0499c68f451dc8b09a85_432536.c
Pass 4: using cached /root/.systemtap/cache/e2/stap_e2b35608bd8c0499c68f451dc8b09a85_432536.ko
Pass 5: starting run.
recvmsg
write
write
epoll_wait
epoll_wait
epoll_wait
recvmsg
read
sendto
futex
recvmsg
recvmsg
recvmsg
poll
recvmsg
recvmsg
```



### SystemTap 处理程序的基本结构

SystemTap 在处理程序中 它们的语法基本上类似于C或awk。

#### 变量
处理程序里面当然可以使用变量，你所需的不过是给它取个好名字，把函数或表达式的值赋给它，然后就可以使用它了。
SystemTap可以自动判定变量的类型。举个例子，如果你用gettimeofday_s()给变量foo赋值，那么foo就是数值类型的，
可以在printf()中通过%d输出。

变量默认只能在其所定义的探针内可用。这意味着变量的生命周期仅仅是处理程序的某次运行。
不过你也可以在探针外定义变量，并使用global修饰它们，这样就能在探针间共享变量了。 ⁠

example1:
```
global count_jiffies, count_ms
probe timer.jiffies(100) { count_jiffies ++ }
probe timer.ms(100) { count_ms ++ }
probe timer.ms(12345)
{
  hz=(1000*count_jiffies) / count_ms
  printf ("jiffies:ms ratio %d:%d => CONFIG_HZ=%d\n",
    count_jiffies, count_ms, hz)
  exit ()
}
```


example1 中 timer-jiffies.stp 通过累加jiffies和milliseconds，来求出内核的CONFIG_HZ配置。
global语句使得count_jiffies和count_ms在每个探针中可用。


#### 目标变量(Target Variables)

跟内核代码相关的事件，如kernel.function("function")和kernel.statement("statement")，
允许使用目标变量获取这部分代码中可访问到的变量的值。
你可以使用-L选项来列出特定探测点下可用的目标变量。
如果已经安装了内核调试信息，你可以通过这个命令获取vfs_read中可用的目标变量

由于 我当前笔记本环境问题，暂时没法使用这个，会报错，后续补充
```
ubuntu@ubuntu-Inspiron-5548:/etc/apt$ sudo stap -L 'kernel.function("vfs_read")'
Tip: /usr/share/doc/systemtap/README.Debian should help you get started.
ubuntu@ubuntu-Inspiron-5548:/etc/apt$ sudo stap -e 'probe kernel.function("vfs_read") {
>            printf ("current files_stat max_files: %d\n",
>                    @var("[email protected]/file_table.c")->max_files);
>            exit(); }'
semantic error: while resolving probe point: identifier 'kernel' at <input>:1:7
        source: probe kernel.function("vfs_read") {
                      ^

semantic error: missing x86_64 kernel/module debuginfo [man warning::debuginfo] under '/lib/modules/5.4.0-58-generic/build'

Pass 2: analysis failed.  [man error::pass2]
Tip: /usr/share/doc/systemtap/README.Debian should help you get started.
ubuntu@ubuntu-Inspiron-5548:/etc/apt$
```



```
Inspiron-5548@ubuntu: ~/workspace/linux-stable/drivers# stap -l 'syscall.*'
syscall.accept
syscall.accept4
syscall.accesso
syscall.acct
syscall.add_key
syscall.adjtimex
syscall.alarm
syscall.arch_prctl
```


#### 整齐打印目标变量（Pretty Printing Target Variables）

某些场景中，我们可能需要输出当前可访问的各种变量，以便于记录底层的变化。SystemTap提供了一些操作，可以生成描述特定目标变量的字符串：

`$$vars`

输出作用域内每个变量的值。等价于sprintf("parm1=%x ... parmN=%x var1=%x ... varN=%x", parm1, ..., parmN, var1, ..., varN)。如果变量的值在运行时找不到，输出=?。

`$$locals`

同`$$vars`，只输出本地变量。

`$$parms`

同`$$vars`，只输出函数入参。

`$$return`

仅在带return的探针中可用。如果被监控的函数有返回值，它等价于sprintf("return=%x", $return)，否则为空字符串。





#### 条件语句

有些时候，你写的SystemTap脚本较为复杂，可能需要用上条件语句。SystemTap支持C风格的条件语句，另外还支持foreach (VAR in ARRAY) {}形式的遍历。

#### 命令行参数
通过$或@加个数字的形式可以访问对应位置的命令行参数。用$会把用户输入当作整数，用@会把用户输入当作字符串。

probe kernel.function(@1) { }
probe kernel.function(@1).return { }
上面的脚本期望用户把要监控的函数作为命令行参数传递进来。你可以让脚本接受多个命令行参数，分别命名为@1，@2等等，按用户输入的次序逐个对应。





## Tapsets
tapsets是一些包含常用的探针和函数的内置脚本，你可以在SystemTap脚本中复用它们。

当用户运行一个SystemTap脚本时，SystemTap会检测脚本中的事件和处理程序，并在翻译脚本成C代码之前，加载用到的tapset。
就像SystemTap脚本一样，tapset的拓展名也是.stp。
默认情况下tapset位于/usr/share/systemtap/tapset/。

跟SystemTap脚本不同的是，tapset不能被直接运行；它只能作为库使用。
tapset库让用户能够在更高的抽象层次上定义事件和函数。
tapset提供了一些常用的内核函数的别名，这样用户就不需要记住完整的内核函数名了（尤其是有些函数名可能会因内核版本的不同而不同）。
另外tapset也提供了常用的辅助函数，比如之前我们见过的thread_indent()。






## 总结

SystemTap 使用过程中发现 他解析编译极其慢，很耗费 CPU资源，最好做到一次解析编译模块，可以到处
部署，实际SystemTap 也已经支持了这样的做法。










参考[SystemTap 内核文档](https://spacewander.gitbooks.io/systemtapbeginnersguide_zh/content/2_3_RunningSystemTapScripts.html)

参考 [RedHat systemTap 文档](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html-single/systemtap_beginners_guide/index)


参考 [文档](https://sourceware.org/systemtap/SystemTap_Beginners_Guide/index.html)
