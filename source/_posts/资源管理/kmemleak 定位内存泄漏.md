---
title: kmemleak 定位内存泄露
date: 2021-01-16 19:00:00
tags:
    - 内核内存泄漏
    - 内存泄漏
    - kmemleak
categories:
    - linux内核
---


## kmemleak 原理
Basic Algorithm
The memory allocations via kmalloc(), vmalloc(), kmem_cache_alloc() and friends are traced and the pointers, together with additional information like size and stack trace, are stored in a rbtree. The corresponding freeing function calls are tracked and the pointers removed from the kmemleak data structures.

An allocated block of memory is considered orphan if no pointer to its start address or to any location inside the block can be found by scanning the memory (including saved registers). This means that there might be no way for the kernel to pass the address of the allocated block to a freeing function and therefore the block is considered a memory leak.

The scanning algorithm steps:

mark all objects as white (remaining white objects will later be considered orphan)
scan the memory starting with the data section and stacks, checking the values against the addresses stored in the rbtree. If a pointer to a white object is found, the object is added to the gray list
scan the gray objects for matching addresses (some white objects can become gray and added at the end of the gray list) until the gray set is finished
the remaining white objects are considered orphan and reported via /sys/kernel/debug/kmemleak
Some allocated memory blocks have pointers stored in the kernel’s internal data structures and they cannot be detected as orphans. To avoid this, kmemleak can also store the number of values pointing to an address inside the block address range that need to be found so that the block is not considered a leak. One example is __vmalloc().

## kmemleak 使用
kmemleak 功能一开始默认是不开启的，需要配置如下选项
```
if [ $debug_kmemleak == 1 ]
then
## kmemleak detect and panic start
	echo "CONFIG_DEBUG_KMEMLEAK=y" >> /tmp/.config
	echo "CONFIG_DEBUG_KMEMLEAK_MEM_POOL_SIZE=16000" >> /tmp/.config
	echo "CONFIG_DEBUG_KMEMLEAK_AUTO_SCAN=y" >> /tmp/.config
	echo "CONFIG_BOOTPARAM_HUNG_TASK_PANIC_VALUE=1" >> /tmp/.config
## kmemleak detect and panic end
fi
```

参考[test code](https://github.com/liulangrenaaa/test_modules/blob/main/resource_leak/kmemleak/kmemleak.c)

一开始遇到了无法安装的问题，后来发现是因为模块名 一样导致的问题。。
参考[bug](https://stackoverflow.com/questions/16360689/invalid-parameters-error-when-trying-to-insert-module-that-accesses-exported-s)

触发开始扫描，这是个同步过程，内存比较大的话可能比较耗时
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# echo scan > /sys/kernel/debug/kmemleak
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug#
```

查看扫描结果
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# cat kmemleak
unreferenced object 0xffff8da0cac1c500 (size 32):
  comm "insmod", pid 3529, jiffies 4294873584 (age 562.798s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
  backtrace:
    [<00000000ae5c9724>] 0xffffffffc030702d
    [<00000000afc3b54e>] do_one_initcall+0x56/0x2b0
    [<000000000724192e>] do_init_module+0x56/0x200
    [<00000000996ecfff>] load_module+0x2348/0x26e0
    [<000000004fa63e1a>] __do_sys_finit_module+0xa0/0xe0
    [<00000000cddcb6e5>] do_syscall_64+0x33/0x40
    [<00000000a0266b85>] entry_SYSCALL_64_after_hwframe+0x44/0xa9
unreferenced object 0xffff8da0d2371000 (size 1024):
  comm "insmod", pid 3529, jiffies 4294873584 (age 562.798s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<0000000079fd2c9c>] 0xffffffffc030709c
    [<00000000afc3b54e>] do_one_initcall+0x56/0x2b0
    [<000000000724192e>] do_init_module+0x56/0x200
    [<00000000996ecfff>] load_module+0x2348/0x26e0
    [<000000004fa63e1a>] __do_sys_finit_module+0xa0/0xe0
    [<00000000cddcb6e5>] do_syscall_64+0x33/0x40
    [<00000000a0266b85>] entry_SYSCALL_64_after_hwframe+0x44/0xa9
unreferenced object 0xffff8da0ca534000 (size 4096):
  comm "insmod", pid 3529, jiffies 4294873584 (age 562.862s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<000000000526120c>] 0xffffffffc0307130
    [<00000000afc3b54e>] do_one_initcall+0x56/0x2b0
    [<000000000724192e>] do_init_module+0x56/0x200
    [<00000000996ecfff>] load_module+0x2348/0x26e0
    [<000000004fa63e1a>] __do_sys_finit_module+0xa0/0xe0
    [<00000000cddcb6e5>] do_syscall_64+0x33/0x40
    [<00000000a0266b85>] entry_SYSCALL_64_after_hwframe+0x44/0xa9
unreferenced object 0xffffaa50801fb000 (size 4096):
  comm "insmod", pid 3529, jiffies 4294873584 (age 562.862s)
  hex dump (first 32 bytes):
    27 94 40 81 50 aa ff ff 27 04 00 00 00 00 00 00  '.@.P...'.......
    7c 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  |...............
  backtrace:
    [<00000000854ee6a4>] __vmalloc_node_range+0x236/0x270
    [<00000000a355227b>] __vmalloc_node+0x3f/0x60
    [<0000000039b16a7e>] 0xffffffffc0307149
    [<00000000afc3b54e>] do_one_initcall+0x56/0x2b0
    [<000000000724192e>] do_init_module+0x56/0x200
    [<00000000996ecfff>] load_module+0x2348/0x26e0
    [<000000004fa63e1a>] __do_sys_finit_module+0xa0/0xe0
    [<00000000cddcb6e5>] do_syscall_64+0x33/0x40
    [<00000000a0266b85>] entry_SYSCALL_64_after_hwframe+0x44/0xa9
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug#
```
可以比较清楚的看到 可能leak的 object点，且有详细调用栈，排查起来十分方便


清除之前扫描结果
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# echo clear  > /sys/kernel/debug/kmemleak
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# cat kmemleak
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug#
```

## kmemleak 代码

后续填坑



## kmemleak overhead
当然假设我们场景允许 使能kmemleak之后，重新编译 kernel，也要关心 kmemleak 所带来的
overhead是否允许，如果你的场景本来就是一个高负载的已经80%多的CPU使用率了，然后开启
kmemleak,是很可能出问题的。

在 公司 一款三核心的 Cortex-A7 的产品中测试结果：
        disabled        enabled     Per Core增加%       换算成单核CPU%
User:     3.54%          7.63%          4.09%            12.27%
Sys:      10.68%         23.76%         13.08%           38.7%
Idle:     84.6%          67.68%         17.02%           -50.76%

在我自己 qemu 虚拟机中测试结果是：

        disabled        enabled     Per Core增加%       换算成单核CPU%
User:     3.54%          7.63%                           12.27%
Sys:      10.68%         23.76%                          38.7%
Idle:     84.6%          67.68%                          -50.76%





参考[内核文档](https://www.kernel.org/doc/html/latest/dev-tools/kmemleak.html)