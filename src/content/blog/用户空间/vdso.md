---
title: vdso
date: 2020-09-12 19:00:00
tags:
    - vdso
categories:
    - linux内核
slug: "用户空间/vdso"
---


## 系统调用
linux 系统调用需要用户态，内核态中切换，代价比较大。
假设 `gettimeofday` 这种常用的系统调用，在无人机这种场景中几乎每个service都需要频繁去调用，这样势必会导致较大的开销(无论采用早期的int 0x80/iret中断，还是sysenter/sysexit指令，再到syscall/sysexit指令)。

linux针对这种场景推出了 `vsyscall` 和 `vdso` 两种解决方案。


## vsyscall
`virtual system call`，`vsyscall` 的工作原则其实十分简单。Linux 内核在`用户空间`映射一个包含一些`内核变量`及一些`系统调用`的实现的内存页。

有些系统调用不会向 `kernel` 传递什么参数，只是读取一些参数比如时间等信息；这种参数都是kernel定期去更新；这类系统调用就很适合放到 `vsyscall`中,

`ubuntu 20.04` 开启了下面这些 和 `vsyscall` 相关的宏
```
ubuntu@zeku_server:~ $ cat /boot/config-5.4.0-72-generic | grep VSYSCALL
CONFIG_GENERIC_TIME_VSYSCALL=y
CONFIG_X86_VSYSCALL_EMULATION=y
# CONFIG_LEGACY_VSYSCALL_EMULATE is not set
CONFIG_LEGACY_VSYSCALL_XONLY=y
# CONFIG_LEGACY_VSYSCALL_NONE is not set
ubuntu@zeku_server:~ $
```

在 `/proc/$self/maps` 也可以看到 `vsyscall` 的 section段
```
ubuntu@zeku_server:~ $ cat /proc/self/maps
558ea272a000-558ea272c000 r--p 00000000 103:02 9830525                   /bin/cat
558ea272c000-558ea2731000 r-xp 00002000 103:02 9830525                   /bin/cat
558ea2731000-558ea2734000 r--p 00007000 103:02 9830525                   /bin/cat
558ea2734000-558ea2735000 r--p 00009000 103:02 9830525                   /bin/cat
558ea2735000-558ea2736000 rw-p 0000a000 103:02 9830525                   /bin/cat
558ea34ce000-558ea34ef000 rw-p 00000000 00:00 0                          [heap]
7f2093d4a000-7f2093d6c000 rw-p 00000000 00:00 0
7f2093d6c000-7f20945dc000 r--p 00000000 103:02 11280639                  /usr/lib/locale/locale-archive
7f20945dc000-7f2094601000 r--p 00000000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f2094601000-7f2094779000 r-xp 00025000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f2094779000-7f20947c3000 r--p 0019d000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f20947c3000-7f20947c4000 ---p 001e7000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f20947c4000-7f20947c7000 r--p 001e7000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f20947c7000-7f20947ca000 rw-p 001ea000 103:02 7079520                   /lib/x86_64-linux-gnu/libc-2.31.so
7f20947ca000-7f20947d0000 rw-p 00000000 00:00 0
7f20947e4000-7f20947e5000 r--p 00000000 103:02 7077894                   /lib/x86_64-linux-gnu/ld-2.31.so
7f20947e5000-7f2094808000 r-xp 00001000 103:02 7077894                   /lib/x86_64-linux-gnu/ld-2.31.so
7f2094808000-7f2094810000 r--p 00024000 103:02 7077894                   /lib/x86_64-linux-gnu/ld-2.31.so
7f2094811000-7f2094812000 r--p 0002c000 103:02 7077894                   /lib/x86_64-linux-gnu/ld-2.31.so
7f2094812000-7f2094813000 rw-p 0002d000 103:02 7077894                   /lib/x86_64-linux-gnu/ld-2.31.so
7f2094813000-7f2094814000 rw-p 00000000 00:00 0
7ffc7c696000-7ffc7c6b7000 rw-p 00000000 00:00 0                          [stack]
7ffc7c754000-7ffc7c757000 r--p 00000000 00:00 0                          [vvar]
7ffc7c757000-7ffc7c758000 r-xp 00000000 00:00 0                          [vdso]
ffffffffff600000-ffffffffff601000 --xp 00000000 00:00 0                  [vsyscall]
ubuntu@zeku_server:~ $
```

## vdso
`vdso` 全称 `virtual dynamic share object`。
由于 `vsyscall` 会将某些系统调用或者数据 固定映射到某个物理地址，这样存在一定的安全隐患，所以后面就出现了 `vdso` 这样的替代方案。

vdso的随机映射在一定程度上缓解了安全威胁。虽然有了vdso，但从历史兼容性上来讲，vsyscall不能就此完全抛弃，否则将导致一些陈旧的（特别是静态连接的）应用程序无法执行，因此现在在5.4内核上，还可以同时看到vdso和vsyscall。

`ubuntu 20.04` 开启了下面这些 和 `vdso` 相关的宏
```
ubuntu@zeku_server:~ $ cat /boot/config-5.4.0-72-generic | grep VDSO
# CONFIG_COMPAT_VDSO is not set
CONFIG_HAVE_GENERIC_VDSO=y
ubuntu@zeku_server:~ $
```


在 `/proc/$self/maps` 也可以看到 `vdso` 的 section 段
```
ubuntu@zeku_server:~ $ cat /proc/self/maps | grep vdso
7fffd4086000-7fffd4087000 r-xp 00000000 00:00 0                          [vdso]
ubuntu@zeku_server:~ $
```


可以将vdso看成一个shared objdect file（这个文件实际上不存在）,内核将其映射到某个地址空间，被所有程序所共享。（我觉得这里用到了一个技术：多个虚拟页面映射到同一个物理页面。即内核把vdso映射到某个物理页面上，然后所有程序都会有一个页表项指向它，以此来共享，这样每个程序的vdso地址就可以不相同了）

几乎所有程序都会连接 `vdso` 这个库
```
ubuntu@zeku_server:~ $ ldd /bin/cat
	linux-vdso.so.1 (0x00007ffd75ff5000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f4775d15000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f4775f29000)
ubuntu@zeku_server:~ $ ldd /bin/uname
	linux-vdso.so.1 (0x00007ffc839be000)
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f7a445f0000)
	/lib64/ld-linux-x86-64.so.2 (0x00007f7a44803000)
ubuntu@zeku_server:~ $
```


## tests
linux kernel 针对 `vdso` 有一些测试项目位于 `tools/testing/selftests/vDSO`，

```
ubuntu@zeku_server:~/workspace/linux/tools/testing/selftests/vDSO $ ls
Makefile      parse_vdso.h   vdso_standalone_test_x86.c  vdso_test_clock_getres.c  vdso_test_getcpu.c
parse_vdso.c  vdso_config.h  vdso_test_abi.c             vdso_test_correctness.c   vdso_test_gettimeofday.c
ubuntu@zeku_server:~/workspace/linux/tools/testing/selftests/vDSO $ make
gcc -std=gnu99    vdso_test_gettimeofday.c parse_vdso.c  -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_test_gettimeofday
gcc -std=gnu99    vdso_test_getcpu.c parse_vdso.c  -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_test_getcpu
gcc -std=gnu99    vdso_test_abi.c parse_vdso.c  -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_test_abi
gcc -std=gnu99    vdso_test_clock_getres.c  -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_test_clock_getres
gcc -std=gnu99 -nostdlib -fno-asynchronous-unwind-tables -fno-stack-protector \
        vdso_standalone_test_x86.c parse_vdso.c \
        -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_standalone_test_x86
gcc -std=gnu99 \
        vdso_test_correctness.c \
        -o /home/ubuntu/workspace/linux/tools/testing/selftests/vDSO/vdso_test_correctness \
        -ldl
ubuntu@zeku_server:~/workspace/linux/tools/testing/selftests/vDSO $ ls
Makefile       vdso_standalone_test_x86    vdso_test_clock_getres    vdso_test_getcpu
parse_vdso.c   vdso_standalone_test_x86.c  vdso_test_clock_getres.c  vdso_test_getcpu.c
parse_vdso.h   vdso_test_abi               vdso_test_correctness     vdso_test_gettimeofday
vdso_config.h  vdso_test_abi.c             vdso_test_correctness.c   vdso_test_gettimeofday.c
ubuntu@zeku_server:~/workspace/linux/tools/testing/selftests/vDSO $
```
