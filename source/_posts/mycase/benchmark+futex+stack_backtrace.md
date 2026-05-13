---
title: benchmark+futex+stack_backtrace
date: 2022-09-20 19:00:40
tags:
    - benchmark
    - posix
    - futex
    - stack_backtrace
categories:
    - linux内核
---

## 背景
X3芯片为了性能功耗平衡等原因做了10core，在X3芯片跑分摸底测试的时候，发现多线程跑分较低，原因是某个case跑分只有预期的一半左右。

## case分析
后详细分析 `geekbench-208` `geekbench-209` case，是开了10个线程每个线程都做同样的计算任务，以最后一个完成计算任务的线程的结束时间点来 衡量芯片X3的多线程能力。跑分低的实际原因就是最后一个完成计算任务的task消耗时间太久。

分析可能原因有以下几个：
1. 因为是10core，架构是2+2+6(2个超大核，2个大核，6个小核)，超大核心计算能力强，计算任务很快可以完成，小核心由于算力弱，计算任务需要的时间久，如果超大核上的任务运行结束之后，小核上的计算任务不能及时迁移到大核心上去，其实整个X3芯片的多线程能力大概就是10*小核单线程能力的数值，就会导致整体X3芯片跑分很低

2. 超大核心上的任务完成之后，大核与小核的任务能够及时 `up migration`，但是 `up migration`的时间较长，导致超大核心在完成计算任务之后到接收小核心 `up migration`的任务的过程时间较长，浪费了一部分算力，导致整体运行时间较长，整体X3芯片跑分较低。

3. 任务能够进行及时的`up migration`，但是运行过程中不断被其他线程抢占导致睡眠，或者由于 `geekbench` 代码导致多线程锁争用导致竞争较大，计算任务有很多的任务切换和等待资源的睡眠，导致整体运行时间较长，整体X3芯片跑分较低。


## 初步排查
在实际X3芯片上抓systrace，看到`geekbench-208` case 在跑分的时候每个core上的线程频繁切换，平均运行不到1ms就会进行一次任务切换。然后睡眠约100-300us。这个实在是太频繁了！

`geekbench-208` 这个case在 pixel6上跑，基本300-400ms才会进行一次上下文切换。
所以问题就出现在这个频繁任务切换和睡眠上，从systrace中看这个还大部分是R状态，应该是等待资源导致的。

芯片平台比较容易编译kernel重新烧录，修改 sched_block_reason tracepoint，加入了一些额外信息（dump_stack）, 在sched_wakeup路径中针对 `comm=="geekbench"` task的唤醒 打印调用堆栈，发现很多是 futex_wakeup。

可以初步判断问题很可能是上层代码 geekbench导致的。

## WHY Futex?
由于X3芯片平台还处于用 zeku等仿真平台仿真阶段，实际运行非常慢，但是geekbench的代码都是一样的，我们考虑在pixel6的平台上去找出 geekbench的代码逻辑问题，到底是哪里使用了这么多futex?

先使用 strace 来看一下系统调用情况：`strace -c -f `
80% 时间都是futex。 futex系统调用发生了21041次，错误了4303次，就是caller需要等待 4303次，出去 futex有一半是唤醒的调用，那么 4000 / ((21000 - 4000) / 2) = 50%，意味着50%的futex系统调用都需要去 sleep。

直接使用了gdb来debug `geekbench5-208`，重新编译 `geekbench-208`之后，在`__futex_wait_ex` 打下断点，运行，但是由于 gdb 实现是依赖于 ptrace的，会严重影响应用程序的运行效率，很多问题速度一慢，就不会出现了，所以线索到这里就中断了。

ptrace系统函数是Linux内核提供的一个用于进程跟踪的系统调用，通过它，一个进程(gdb)可以读写另外一个进程(test)的指令空间、数据空间、堆栈和寄存器的值。而且gdb进程接管了test进程的所有信号，也就是说系统向test进程发送的所有信号，都被gdb进程接收到，这样一来，test进程的执行就被gdb控制了，从而达到调试的目的。

## 找到元凶
因为已经找到了是上层应用调用futex导致频繁进入睡眠和进程切换的，所以问题就变成了要想办法找到上层调用futex的caller。

有几个方案：
1. 直接想到的是futex的等待队列上是不是保存了caller且睡眠的 task信息，通过task先找到task的用户空间栈内存，通过栈回溯的方法找到用户栈，由于可能没有符号表信息，分析进的vma，找出其中的符号关系，最后打印出来。

2. 还想到 `strace -k` 也能打印出相关的 `stack-traces`，用户空间的系统调用的栈都被打印出来，然后想找出`geekbench-208`应用到底哪里有问题就比较容易了。


### 方案一
此方案是联想到mutex or semaphore等机制，有一个锁实例，锁实例中有一个 `wait_list` 链表，如果 futex上也有这样一个 `wait_list` 的话，那么可以通过在 futex_wait 中，查到










### 方案二
但是 android 自带的strace是不带 `-k` 这个选项的，需要自己重新编译来获得。
但是重新编译 strace 遇到了很多坑！！

`strace.c` 文件中，将 `ENABLE_STACKTRACE` 打开

```
#ifdef ENABLE_STACKTRACE
"\
  -k, --stack-traces\n\
                 obtain stack trace between each syscall\n\
"
#endif
```

直接编译arm64版本会报错，原因是在打开宏之后，添加unwind.c到编译，会有unwind的linker error，即strace 打印stack依赖于libunwind或者libdw，而libunwind已经全部被重构成C++也没有再实现unwind.c中声明的几个函数，于是libdw就成了最后的希望，再次解决了仅有host lib、缺失头文件等错误后，终于成功，最终的patch如下：

```
diff --git a/Android.bp b/Android.bp
old mode 100644
new mode 100755
index 801cffa..fcef2e8
--- a/Android.bp
+++ b/Android.bp
@@ -240,8 +240,18 @@ cc_binary {
         "xattr.c",
         "xlat.c",
         "xmalloc.c",
+	"unwind.c",
+	"unwind-libdw.c",
+    ],
+    include_dirs: [
+    	"external/elfutils/include",
+    	"external/elfutils/libelf",
+    ],
+		whole_static_libs: [
+				"libelf",
+        "libdw_test",
+        "libz",
     ],
-
     // We have "config.h", but since we're using one file for both LP32 and LP64,
     // we need to set the hard-coded size #defines here instead.
     cflags: ["-DHAVE_CONFIG_H"] + [
@@ -285,7 +295,7 @@ cc_binary {
             ],
         },
         arm64: {
-            cflags: ["-DAARCH64=1"],
+            cflags: ["-DAARCH64=1"]+["-DENABLE_STACKTRACE"],

             local_include_dirs: [
                 "linux/aarch64",
diff --git a/strace.c b/strace.c
index 62142d8..21d56b9 100644
--- a/strace.c
+++ b/strace.c
@@ -213,7 +213,7 @@ print_version(void)
 {
 	static const char features[] =
 #ifdef ENABLE_STACKTRACE
-		" stack-trace=" USE_UNWINDER
+		" stack-trace=true"
 #endif
 #ifdef USE_DEMANGLE
 		" stack-demangle"
diff --git a/unwind-libdw.c b/unwind-libdw.c
old mode 100644
new mode 100755
```

还有个elfutils.diff，但是内容太多。

使用支持-k指令的strace抓取pixel6的clang测试项可以得到如下futex堆栈：

```
...
...
```
其中走getTSDAndLockSlow这个分支占了绝大多数，于是先针对这个进行分析。

后面发现是 android 使用的是 Scudo 分配器。Scudo 是一个动态的用户模式内存分配器（也称为堆分配器），旨在抵御与堆相关的漏洞（如基于堆的缓冲区溢出、释放后再使用和重复释放），同时保持性能良好。它提供了标准 C 分配和取消分配基元（如 malloc 和 free），以及 C++ 基元（如 new 和 delete）。

其中有一段内存分配的代码，其中两个锁，在八个线程时争夺两把锁其实还好。在X3芯片平台上有10个线程去争夺两把锁，如果争夺不到锁就会用futex去等待，最后进入睡眠，然后被 futex唤醒。最后在pixel6 平台上将资源变为8个，在X3平台上将资源锁变为10个，自此lock contention大大降低，futex调用频率也大大降低，`geekbench` 的跑分线程进入睡眠的次数也大大减少，跑分也有很大提升。



在X3平台上回归，Clang提升了120%，HTML5提升了40%,Texture Rendering提升了30%，PDF Rendering提升了10%。总跑分提升了 4%


总的来看此问题的根本原因就是SCUDO分配器中不合理的TSD实例数量配置导致的特定场景的lock contention，降低了多线程效率，导致X3芯片跑分较低。
至此问题基本解决，下面还需要确认的是8个TSD实例会对Mem有多大影响；以及系统层面还有那些参数是需要10核适配的。

