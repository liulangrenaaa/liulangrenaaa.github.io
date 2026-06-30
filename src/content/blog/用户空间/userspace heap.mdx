---
title: userspace heap
date: 2021-09-23 19:00:00
tags:
    - userspace heap
    - heap
categories:
    - linux内核
slug: "用户空间/userspace-heap"
---



## heap 位置
通常来说 heap 与stack 对应，相向增长。为了内存使用不浪费，程序一开始运行的heap 也不会设置的很大，后续根据需要来扩大增长 heap顶部，实现 heap size的增长。

c语言中，需求就是`malloc`需要分配内存的时候，通过 `brk` 来扩展 heap top。

```
............

------------  heap top    ---- program break
        | ---> heap size
------------  start brk   ---- heap bottom

............
```



## brk sbrk
```
#include <unistd.h>

int brk(void *addr);
void *sbrk(intptr_t increment);
```

`brk` 是系统调用， `sbrk` 是 linux libc中的。

brk: 传入的参数是绝对地址，将 `heap top` 设置在那里。
sbrk: 传入的参数是相对偏移，正数是将 `heap top` 上移，负数是将`heap top` 下移，

```
#include <unistd.h>

int main(void)
{
        int i = 0;
        for (i = 0; i < 1000; i++) {
                sbrk(i);
        }

        return 0;
}
```

使用strace 跟踪编译出来的bin文件执行，得到
```
......
brk(NULL)                               = 0x555cd761b000
brk(0x555cd761b001)                     = 0x555cd761b001
brk(0x555cd761b003)                     = 0x555cd761b003
brk(0x555cd761b006)                     = 0x555cd761b006
brk(0x555cd761b00a)                     = 0x555cd761b00a
brk(0x555cd761b00f)                     = 0x555cd761b00f
brk(0x555cd761b015)                     = 0x555cd761b015
......
```
可以看到最终也是调用到 `brk`，


## 使用 sbrk 进行内存分配




## 使用brk进行内存分配



































