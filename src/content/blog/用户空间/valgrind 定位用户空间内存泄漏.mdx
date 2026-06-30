---
title: valgrind 定位用户空间内存泄漏
date: 2021-01-17 19:00:00
tags:
    - 用户内存泄漏
    - 内存泄漏
    - valgrind
categories:
    - linux内核
slug: "用户空间/valgrind-定位用户空间内存泄漏"
---



## WHY
在实际开发中，某个应用程序如果存在内存泄露，且是长时间运行的程序，就会导致比较严重的后果。
在一些业务场景的长跑测试中，这些问题往往会充分暴露出来。

一般情况下这种内存泄漏都是以 OOM Kill 而结尾的。 kmsg log 往往只有 这个进程确实消耗了大量进
程的证据，但是无法确切知道是哪里的内存泄漏，这里就需要一个工具来帮助检测，如果是发生内存泄漏之后
仅仅通过人肉去分析代码，往往很困难。

valgrind 就是这样一款 强大的工具：
1. 检查用户空间内存泄漏
2. 检查

## valdrind 原理


## valdrind 安装，使用

直接安装， ubuntu 官方软件源已经包含了，其他平台可以通过源码编译安装
```
tencent_clould@100ubuntu: ~/workspace/test_modules/resource_leak/user_space_memleak# sudo apt install valgrind
Reading package lists... Done
Building dependency tree
Reading state information... Done
The following packages were automatically installed and are no longer required:
  openbsd-inetd openjdk-11-jdk-headless tcpd update-inetd
Use 'sudo apt autoremove' to remove them.
Suggested packages:
  valgrind-dbg valgrind-mpi kcachegrind alleyoop valkyrie
The following NEW packages will be installed:
  valgrind
0 upgraded, 1 newly installed, 0 to remove and 231 not upgraded.
Need to get 20.3 MB of archives.
After this operation, 90.0 MB of additional disk space will be used.
Get:1 https://mirrors.tuna.tsinghua.edu.cn/ubuntu focal-updates/main amd64 valgrind amd64 1:3.15.0-1ubuntu9.1 [20.3 MB]
48% [1 valgrind 12.2 MB/20.3 MB 60%]
tencent_clould@ubuntu: ~/workspace/test_modules/resource_leak/user_space_memleak# ls
```

使用如下代码检测
```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void main(void)
{
        int i = 3;
        char *p = NULL;
        p = malloc(1024 * 1024);
        if (!p)
                printf("malloc failed,just wait!!\n");

        printf("malloc sucess,just wait!!\n");

        while(i--) {
                usleep(1000 * 1000);
        }
}
```


对于 valgrind 不好的地方在于：
1. 对于想使用 valgrind来检查内存泄漏的业务来说，必须从开始 用valgrind 启动，意味着对于业务
需要重启。还有比如很难复现的内存泄漏，等你重启业务用 valgrind来启动，说不定又不复现了。。

2. 对于 valgrind 启动的业务来说，会比直接启动有一些性能损失。


### userspace memleak demo
使用上面代码 直接用 `valgrind` 启动
```
tencent_clould@ubuntu: ~/workspace/test_modules/resource_leak/user_space_memleak# valgrind ./a.out
==2813281== Memcheck, a memory error detector
==2813281== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==2813281== Using Valgrind-3.15.0 and LibVEX; rerun with -h for copyright info
==2813281== Command: ./a.out
==2813281==
malloc sucess,just wait!!
==2813281==
==2813281== HEAP SUMMARY:
==2813281==     in use at exit: 1,048,576 bytes in 1 blocks
==2813281==   total heap usage: 2 allocs, 1 frees, 1,049,600 bytes allocated
==2813281==
==2813281== LEAK SUMMARY:
==2813281==    definitely lost: 1,048,576 bytes in 1 blocks
==2813281==    indirectly lost: 0 bytes in 0 blocks
==2813281==      possibly lost: 0 bytes in 0 blocks
==2813281==    still reachable: 0 bytes in 0 blocks
==2813281==         suppressed: 0 bytes in 0 blocks
==2813281== Rerun with --leak-check=full to see details of leaked memory
==2813281==
==2813281== For lists of detected and suppressed errors, rerun with: -s
==2813281== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```

可以看到 `HEAP SUMMARY:` 中写了
```
==2813281==     in use at exit: 1,048,576 bytes in 1 blocks
==2813281==   total heap usage: 2 allocs, 1 frees, 1,049,600 bytes allocated
```
在进程退出时，仍然有 `1048576 bytes` 内存在使用中，这部分就是泄漏的内存。但是我们仍然不能确
定到底是哪里泄漏的内存，按照他的建议 加上 `-leak-check=full`

```
tencent_clould@ubuntu: ~/workspace/test_modules/resource_leak/user_space_memleak# valgrind  --leak-check=full  ./a.out
==2813434== Memcheck, a memory error detector
==2813434== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==2813434== Using Valgrind-3.15.0 and LibVEX; rerun with -h for copyright info
==2813434== Command: ./a.out
==2813434==
malloc sucess,just wait!!
==2813434==
==2813434== HEAP SUMMARY:
==2813434==     in use at exit: 1,048,576 bytes in 1 blocks
==2813434==   total heap usage: 2 allocs, 1 frees, 1,049,600 bytes allocated
==2813434==
==2813434= 1,048,576 bytes in 1 blocks are definitely lost in loss record 1 of 1
==2813434==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2813434==    by 0x1091AD: main (in /home/ubuntu/workspace/test_modules/resource_leak/user_space_memleak/a.out)
==2813434==
==2813434== LEAK SUMMARY:
==2813434==    definitely lost: 1,048,576 bytes in 1 blocks
==2813434==    indirectly lost: 0 bytes in 0 blocks
==2813434==      possibly lost: 0 bytes in 0 blocks
==2813434==    still reachable: 0 bytes in 0 blocks
==2813434==         suppressed: 0 bytes in 0 blocks
==2813434==
==2813434== For lists of detected and suppressed errors, rerun with: -s
==2813434== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
tencent_clould@ubuntu: ~/workspace/test_modules/resource_leak/user_space_memleak#
```

可以看到这次， `valgrind` 已经将泄漏的具体位置打印了出来
```
==2813434= 1,048,576 bytes in 1 blocks are definitely lost in loss record 1 of 1
==2813434==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2813434==    by 0x1091AD: main (in /home/ubuntu/workspace/test_modules/resource_leak/user_space_memleak/a.out)
```

可以用 `gcc -g` 重新编译一下带上符号表信息，再次用 valgrind 定位，可以得到更详细信息。
```
==2822695==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2822695==    by 0x1091AD: main (user_space_memleak.c:9)
```
这次直接将 在 哪个文件 哪一行都直接打印出来了。




### out of bounds access demo

代码：
```
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void main(void)
{
        int i = 3;
        char *p = NULL;
        p = malloc(1024);
        if (!p)
                printf("malloc failed,just wait!!\n");

        printf("malloc sucess,just wait!!*(p + 10) = %d\n", *(p + 10));
        *(p + 1023) = *(p + 1024);
        *(p + 1024) = 1;
        while(i--) {
                usleep(1000 * 1000);
        }

        free(p);
        free(p + 1);
}
```

`gcc -g` 编译之偶 用 `valgrind ./a.out` 跑一下
```
tencent_clould@ubuntu: ~/workspace/test_modules/resource_leak/valgrind# valgrind ./a.out
==2826928== Memcheck, a memory error detector
==2826928== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==2826928== Using Valgrind-3.15.0 and LibVEX; rerun with -h for copyright info
==2826928== Command: ./a.out
==2826928==
==2833797== Use of uninitialised value of size 8
==2833797==    at 0x48B681B: _itoa_word (_itoa.c:179)
==2833797==    by 0x48D26F4: __vfprintf_internal (vfprintf-internal.c:1687)
==2833797==    by 0x48BCEBE: printf (printf.c:33)
==2833797==    by 0x109225: main (out_of_bounds_access.c:13)
malloc sucess,just wait!!
==2826928== Invalid read of size 1
==2826928==    at 0x109200: main (out_of_bounds_access.c:14)
==2826928==  Address 0x4a4d440 is 0 bytes after a block of size 1,024 alloc'd
==2826928==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2826928==    by 0x1091CD: main (out_of_bounds_access.c:9)
==2826928==
==2826928== Invalid write of size 1
==2826928==    at 0x109213: main (out_of_bounds_access.c:15)
==2826928==  Address 0x4a4d440 is 0 bytes after a block of size 1,024 alloc'd
==2826928==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2826928==    by 0x1091CD: main (out_of_bounds_access.c:9)
==2826928==
==2845980== Invalid free() / delete / delete[] / realloc()
==2845980==    at 0x483CA3F: free (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x10927F: main (out_of_bounds_access.c:21)
==2845980==  Address 0x4a4d041 is 1 bytes inside a block of size 1,024 free'd
==2845980==    at 0x483CA3F: free (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x10926F: main (out_of_bounds_access.c:20)
==2845980==  Block was alloc'd at
==2845980==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x1091ED: main (out_of_bounds_access.c:9)
==2826928==
==2826928== HEAP SUMMARY:
==2826928==     in use at exit: 0 bytes in 0 blocks
==2826928==   total heap usage: 2 allocs, 3 frees, 2,048 bytes allocated
==2826928==
==2826928== All heap blocks were freed -- no leaks are possible
==2826928==
==2826928== For lists of detected and suppressed errors, rerun with: -s
==2826928== ERROR SUMMARY: 2 errors from 2 contexts (suppressed: 0 from 0)
```

也是直接指出了 一次引用未初始化的内存, 两次越界访问, 一次非法 free：

1. 一次引用为初始化的内存
```
==2833797== Use of uninitialised value of size 8
==2833797==    at 0x48B681B: _itoa_word (_itoa.c:179)
==2833797==    by 0x48D26F4: __vfprintf_internal (vfprintf-internal.c:1687)
==2833797==    by 0x48BCEBE: printf (printf.c:33)
==2833797==    by 0x109225: main (out_of_bounds_access.c:13)
```

2. 一次越界读访问：
```
==2826928== Invalid read of size 1
==2826928==    at 0x109200: main (out_of_bounds_access.c:14)
==2826928==  Address 0x4a4d440 is 0 bytes after a block of size 1,024 alloc'd
==2826928==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2826928==    by 0x1091CD: main (out_of_bounds_access.c:9)
```

3. 一次越界写访问
```
==2826928== Invalid write of size 1
==2826928==    at 0x109213: main (out_of_bounds_access.c:15)
==2826928==  Address 0x4a4d440 is 0 bytes after a block of size 1,024 alloc'd
==2826928==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2826928==    by 0x1091CD: main (out_of_bounds_access.c:9)
```

4. 一次 invaild free
```
==2845980== Invalid free() / delete / delete[] / realloc()
==2845980==    at 0x483CA3F: free (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x10927F: main (out_of_bounds_access.c:21)
==2845980==  Address 0x4a4d041 is 1 bytes inside a block of size 1,024 free'd
==2845980==    at 0x483CA3F: free (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x10926F: main (out_of_bounds_access.c:20)
==2845980==  Block was alloc'd at
==2845980==    at 0x483B7F3: malloc (in /usr/lib/x86_64-linux-gnu/valgrind/vgpreload_memcheck-amd64-linux.so)
==2845980==    by 0x1091ED: main (out_of_bounds_access.c:9)
```

## 总结

实际项目中应用的内存泄漏往往比这要复杂很多，可能代码考虑了正常情况下的 free，异常情况下没有
free等， `valgrind` 是很强大，有很多参数，但也只能帮助我们在出现问题之后定位，还是需要养成良
好的编码习惯，减少杜绝这类问题


参考[文章1](http://senlinzhan.github.io/2017/12/31/valgrind/)
参考[文章2](https://www.cprogramming.com/debugging/valgrind.html)

