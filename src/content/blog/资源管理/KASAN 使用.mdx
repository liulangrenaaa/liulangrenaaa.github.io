---
title: KASAN 定位越界访问
date: 2021-01-27 19:00:00
tags:
    - 内核内存越界
    - use after free
    - double free
    - KASAN
categories:
    - linux内核
slug: "资源管理/KASAN-使用"
---



## KASAN 配置
首先想使用这类根据肯定是需要重新编译内核的。
看下`.config`的改变
```
if [ $debug_KASAN == 1 ]
then
## KASAN detect and panic start
	#---- add
	echo "CONFIG_CONSTRUCTORS=y" >> /tmp/.config
	echo "CONFIG_KASAN_SHADOW_OFFSET=0xdffffc0000000000" >> /tmp/.config
	echo "CONFIG_STACKDEPOT=y" >> /tmp/.config
	echo "CONFIG_KASAN=y" >> /tmp/.config
	echo "CONFIG_KASAN_GENERIC=y" >> /tmp/.config
	echo "CONFIG_KASAN_OUTLINE=y" >> /tmp/.config
	echo "CONFIG_KASAN_STACK=1" >> /tmp/.config
	#---- delect
	sed -i '/CONFIG_VMAP_STACK=y/d' /tmp/.config
## KASAN detect and panic end
fi
```
当然，我在别的地方将$debug_slub_debug也已经打开了.


## KASAN 使用
写了一个test case，参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/memory/kasan_debug/kasan_debug.c)

### oob检测
编译安装模块之后，直接panic了(我设置了`panic_on_warn`。。)，只能通过 `crash` 根据查看 现场的 dmesg log
```
crash> log | tail -n 70
==================================================================
[  114.816452] BUG: KASAN: slab-out-of-bounds in kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452] Write of size 1 at addr ffff8880076053c0 by task kasan_debug/3229
[  114.816452]
[  114.816452] CPU: 1 PID: 3229 Comm: kasan_debug Kdump: loaded Tainted: G           O      5.11.0-rc5+ #6
[  114.816452] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[  114.816452] Call Trace:
[  114.816452]  dump_stack+0x9a/0xcc
[  114.816452]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452]  print_address_description.constprop.0+0x1a/0x140
[  114.816452]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452]  kasan_report.cold+0x7f/0x10e
[  114.816452]  ? ____kasan_kmalloc.constprop.0+0x1/0xa0
[  114.816452]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452]  ? 0xffffffffc0880000
[  114.816452]  kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452]  kthread+0x1aa/0x200
[  114.816452]  ? kthread_create_on_node+0xd0/0xd0
[  114.816452]  ret_from_fork+0x22/0x30
[  114.816452]
[  114.816452] Allocated by task 3229:
[  114.816452]  kasan_save_stack+0x1b/0x40
[  114.816452]  ____kasan_kmalloc.constprop.0+0x84/0xa0
[  114.816452]  kasan_debug_oob+0x29/0x70 [kasan_debug]
[  114.816452]  kthread+0x1aa/0x200
[  114.816452]  ret_from_fork+0x22/0x30
[  114.816452]
[  114.816452] The buggy address belongs to the object at ffff8880076053a0
                which belongs to the cache kmalloc-32 of size 32
[  114.816452] The buggy address is located 0 bytes to the right of
                32-byte region [ffff8880076053a0, ffff8880076053c0)
[  114.816452] The buggy address belongs to the page:
[  114.816452] page:00000000352cff66 refcount:1 mapcount:0 mapping:0000000000000000 index:0x0 pfn:0x7604
[  114.816452] head:00000000352cff66 order:1 compound_mapcount:0
[  114.816452] flags: 0x100000000010200(slab|head)
[  114.816452] raw: 0100000000010200 ffffea0000441688 ffffea0000466d88 ffff888001042540
[  114.816452] raw: 0000000000000000 0000000000130013 00000001ffffffff 0000000000000000
[  114.816452] page dumped because: kasan: bad access detected
[  114.816452]
[  114.816452] Memory state around the buggy address:
[  114.816452]  ffff888007605280: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[  114.816452]  ffff888007605300: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[  114.816452] >ffff888007605380: fc fc fc fc 00 00 00 00 fc fc fc fc fc fc fc fc
[  114.816452]                                            ^
[  114.816452]  ffff888007605400: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[  114.816452]  ffff888007605480: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[  114.816452] ==================================================================
[  114.816452] Disabling lock debugging due to kernel taint
[  114.833983] Kernel panic - not syncing: panic_on_warn set ...
[  114.834833] CPU: 1 PID: 3229 Comm: kasan_debug Kdump: loaded Tainted: G    B      O      5.11.0-rc5+ #6
[  114.835925] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[  114.836979] Call Trace:
[  114.836979]  dump_stack+0x9a/0xcc
[  114.836979]  ? 0xffffffffc0880000
[  114.836979]  panic+0x1ae/0x3c3
[  114.836979]  ? print_oops_end_marker.cold+0x10/0x10
[  114.839656]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.840336]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.841598]  end_report+0x58/0x5e
[  114.841598]  kasan_report.cold+0x9d/0x10e
[  114.841598]  ? ____kasan_kmalloc.constprop.0+0x1/0xa0
[  114.841598]  ? kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.841598]  ? 0xffffffffc0880000
[  114.841598]  kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.841598]  kthread+0x1aa/0x200
[  114.841598]  ? kthread_create_on_node+0xd0/0xd0
[  114.841598]  ret_from_fork+0x22/0x30
```

可以看到报错信息很明显
```
[  114.816452] BUG: KASAN: slab-out-of-bounds in kasan_debug_oob+0x35/0x70 [kasan_debug]
[  114.816452] Write of size 1 at addr ffff8880076053c0 by task kasan_debug/3229
[  114.816452] The buggy address belongs to the object at ffff8880076053a0
                which belongs to the cache kmalloc-32 of size 32
[  114.816452] The buggy address is located 0 bytes to the right of
                32-byte region [ffff8880076053a0, ffff8880076053c0)
```
基本`dis`反汇编一下就能看到出错逻辑


### use after free检测
使用`kasan_debug_use_after_free（）`
重新编译安装（这次我关掉了`panic_on_warn`）,报错信息如下
```
[   98.719080] ==================================================================
[   98.719793] BUG: KASAN: use-after-free in kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793] Write of size 1 at addr ffff8880432ce85e by task kasan_debug/3203

[   98.719793] CPU: 0 PID: 3203 Comm: kasan_debug Kdump: loaded Tainted: G           O      5.11.0-rc5+ #6
[   98.719793] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   98.719793] Call Trace:
[   98.719793]  dump_stack+0x9a/0xcc
[   98.719793]  ? kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793]  print_address_description.constprop.0+0x1a/0x140
[   98.719793]  ? kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793]  ? kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793]  kasan_report.cold+0x7f/0x10e
[   98.719793]  ? kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793]  kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793]  ? 0xffffffffc07b8000
[   98.719793]  ? mark_held_locks+0x24/0x90
[   98.719793]  ? lockdep_hardirqs_on_prepare+0x12e/0x1f0
[   98.719793]  ? _raw_spin_unlock_irqrestore+0x34/0x40
[   98.719793]  ? trace_hardirqs_on+0x1c/0x100
[   98.719793]  ? 0xffffffffc07b8000
[   98.719793]  kthread+0x1aa/0x200
[   98.719793]  ? kthread_create_on_node+0xd0/0xd0
[   98.719793]  ret_from_fork+0x22/0x30

[   98.719793] Allocated by task 3203:
[   98.719793]  kasan_save_stack+0x1b/0x40
[   98.719793]  ____kasan_kmalloc.constprop.0+0x84/0xa0
[   98.719793]  kasan_debug_use_after_free+0xb8/0x180 [kasan_debug]
[   98.719793]  kthread+0x1aa/0x200
[   98.719793]  ret_from_fork+0x22/0x30

[   98.719793] Freed by task 3203:
[   98.719793]  kasan_save_stack+0x1b/0x40
[   98.719793]  kasan_set_track+0x1c/0x30
[   98.719793]  kasan_set_free_info+0x20/0x30
[   98.719793]  ____kasan_slab_free+0xec/0x120
[   98.719793]  kfree+0xcc/0x2e0
[   98.719793]  kasan_debug_use_after_free+0xf6/0x180 [kasan_debug]
[   98.719793]  kthread+0x1aa/0x200
[   98.719793]  ret_from_fork+0x22/0x30

[   98.719793] The buggy address belongs to the object at ffff8880432ce840
                which belongs to the cache kmalloc-32 of size 32
[   98.719793] The buggy address is located 30 bytes inside of
                32-byte region [ffff8880432ce840, ffff8880432ce860)
[   98.719793] The buggy address belongs to the page:
[   98.719793] page:00000000d04b265b refcount:1 mapcount:0 mapping:0000000000000000 index:0xffff8880432ce1c0 pfn:0x432ce
[   98.719793] head:00000000d04b265b order:1 compound_mapcount:0
[   98.719793] flags: 0x100000000010200(slab|head)
[   98.719793] raw: 0100000000010200 ffffea0000720f08 ffff888001041b88 ffff888001042540
[   98.719793] raw: ffff8880432ce1c0 0000000000130011 00000001ffffffff 0000000000000000
[   98.719793] page dumped because: kasan: bad access detected

[   98.719793] Memory state around the buggy address:
[   98.719793]  ffff8880432ce700: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   98.719793]  ffff8880432ce780: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   98.719793] >ffff8880432ce800: fc fc fc fc fc fc fc fc fa fb fb fb fc fc fc fc
[   98.719793]                                                     ^
[   98.719793]  ffff8880432ce880: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   98.719793]  ffff8880432ce900: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   98.719793] ==================================================================
[   98.719793] Disabling lock debugging due to kernel taint
```

可以看到报错信息
```
[   98.719793] BUG: KASAN: use-after-free in kasan_debug_use_after_free+0x109/0x180 [kasan_debug]
[   98.719793] Allocated by task 3203:
[   98.719793] Freed by task 3203:
[   98.719793] The buggy address belongs to the object at ffff8880432ce840
                which belongs to the cache kmalloc-32 of size 32
[   98.719793] The buggy address is located 30 bytes inside of
                32-byte region [ffff8880432ce840, ffff8880432ce860)
```
直接反汇编，基本直接可以找到问题


### double free检测
使用`kasan_debug_double_free`
重新编译安装（这次我关掉了`panic_on_warn`）,报错信息如下
```
[   80.381499] ==================================================================
[   80.508872] ==================================================================
[   80.509767] BUG: KASAN: double-free or invalid-free in kasan_debug_double_free+0x119/0x180 [kasan_debug]
[   80.509767] CPU: 3 PID: 3407 Comm: kasan_debug Kdump: loaded Tainted: G    B      O      5.11.0-rc5+ #6
[   80.509767] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   80.509767] Call Trace:
......

[   80.509767] The buggy address belongs to the object at ffff888010e3b540
                which belongs to the cache kmalloc-32 of size 32
[   80.509767] The buggy address is located 0 bytes inside of
                32-byte region [ffff888010e3b540, ffff888010e3b560)
[   80.509767] The buggy address belongs to the page:
[   80.509767] page:000000001edff74e refcount:1 mapcount:0 mapping:0000000000000000 index:0x0 pfn:0x10e3a
[   80.509767] head:000000001edff74e order:1 compound_mapcount:0
[   80.509767] flags: 0x100000000010200(slab|head)
[   80.509767] raw: 0100000000010200 ffffea0000955888 ffff888001041ba8 ffff888001042540
[   80.509767] raw: 0000000000000000 0000000000130013 00000001ffffffff 0000000000000000
[   80.509767] page dumped because: kasan: bad access detected

[   80.509767] Memory state around the buggy address:
[   80.509767]  ffff888010e3b400: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   80.509767]  ffff888010e3b480: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   80.509767] >ffff888010e3b500: fc fc fc fc fc fc fc fc fa fb fb fb fc fc fc fc
[   80.509767]                                            ^
[   80.509767]  ffff888010e3b580: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
[   80.509767]  ffff888010e3b600: fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc fc
```

可以看到报错信息
```
[   80.509767] BUG: KASAN: double-free or invalid-free in kasan_debug_double_free+0x119/0x180 [kasan_debug]
[   80.509767] The buggy address belongs to the object at ffff888010e3b540
                which belongs to the cache kmalloc-32 of size 32
[   80.509767] The buggy address is located 0 bytes inside of
                32-byte region [ffff888010e3b540, ffff888010e3b560)
```
根据这提示信息和 backtrace，反汇编一下基本就可以找到问题所在

### vmalloc 内存检测
由于 `vmalloc`存在的 `guard page`的原因，基本上只要 `vmalloc`内存存在越界的问题，就会立即报出来
后面加上 `guard page`分析。


## KASAN overhead
当然假设我们场景允许 使能KASAN之后，重新编译 kernel，也要关系 KASAN 所带来的
overhead是否允许。

关于使能 KASAN的 overhead:
1. image 变大
on
```
amd_server@ubuntu: ~/workspace/share/debug# ls -alh
total 1.1G
-rw-r--r-- 1 root   root    17M 1月  26 21:56 bzImage
-rwxr-xr-x 1 root   root   1.1G 1月  26 21:56 vmlinux
```

off
```
amd_server@ubuntu: ~/workspace/share/stable# ls -alh
total 970M
-rw-r--r-- 1 root   root   9.6M 1月  26 11:05 bzImage
-rwxr-xr-x 1 root   root   967M 1月  26 11:05 vmlinux
```

2. 运行速度
原来我自己qemu虚拟机开机12s，开启 kasan 之后开机时间是 20s.

3. cpu使用率
```
on          off
```
我的qemu虚拟机看起来好像区别不大，后面需要用公司机器看一下

4. 内存使用
我的qemu上（2G）
on
```
stable_kernel@kernel: /tmp/share/test_modules/memory/kasan_debug# free -m
              total        used        free      shared  buff/cache   available
Mem:           1419         783          44           6         591         592
Swap:          1497           0        1496
```


## 总结
KASAN 和 slub_debug一样也可以使由于内存越界的检查。
但是原理上截然不同，后续等搞明白原理再分析一波。
