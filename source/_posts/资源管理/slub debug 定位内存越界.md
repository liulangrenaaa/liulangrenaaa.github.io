---
title: slub_debug 定位内存越界
date: 2021-01-26 19:00:00
tags:
    - 内存泄漏越界
    - use after free
    - slub_debug
categories:
    - linux内核
---


## slub_debug 概述

首先需要使能，一般情况下我们系统都是使用 `slub`的。所以只需要打开debug选项即可

```
if [ $debug_slubdebug == 1 ]
then
## slubdebug detect start
	echo "CONFIG_SLUB_DEBUG_ON=y" >> /tmp/.config
## slubdebug detect end
fi
```

写了一个test case,参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/memory/slub_debug/slub_debug.c)

与 `KASAN` 可以自动检测出 内存越界，然后报错不同， `slub_debug` 需要主动触发检测，这里需要使用到`slabinfo` 这个工具（如果是很快释放的slab,其实不需要 slabinfo），源码在 `./tools/vm/` 目录下，可以直接编译得到：

```
jenkins@server:~/workspace/linux_kernel_ltp/tools/vm$ make
make -C ../lib/api
make[1]: Entering directory '/var/lib/jenkins/workspace/linux_kernel_ltp/tools/lib/api'
make -C /var/lib/jenkins/workspace/linux_kernel_ltp/tools/build CFLAGS= LDFLAGS= fixdep
  HOSTCC   fixdep.o
  HOSTLD   fixdep-in.o
  LINK     fixdep
  CC       fd/array.o
  LD       fd/libapi-in.o
  CC       fs/fs.o
  CC       fs/tracing_path.o
  CC       fs/cgroup.o
  LD       fs/libapi-in.o
  CC       cpu.o
  CC       debug.o
  CC       str_error_r.o
  LD       libapi-in.o
  AR       libapi.a
make[1]: Leaving directory '/var/lib/jenkins/workspace/linux_kernel_ltp/tools/lib/api'
gcc -Wall -Wextra -I../lib/ -o page-types page-types.c ../lib/api/libapi.a
gcc -Wall -Wextra -I../lib/ -o slabinfo slabinfo.c ../lib/api/libapi.a
gcc -Wall -Wextra -I../lib/ -o page_owner_sort page_owner_sort.c ../lib/api/libapi.a
jenkins@server:~/workspace/linux_kernel_ltp/tools/vm$ ls -al | grep slab
-rwxrwxr-x  1 jenkins jenkins  50416 1月  26 13:12 slabinfo
-rw-rw-r--  1 jenkins jenkins  37868 12月 20 22:58 slabinfo.c
-rw-rw-r--  1 jenkins jenkins   4817 12月 20 22:58 slabinfo-gnuplot.sh
jenkins@server:~/workspace/linux_kernel_ltp/tools/vm$
```

`slabinfo` 也有多个功能，主动触发 合法性检查`slabinfo -v` 只是一项，还有比如
```
stable_kernel@kernel: /tmp/share/test_modules/memory/slub_debug# ./slabinfo --help
slabinfo 4/15/2011. (c) 2007 sgi/(c) 2011 Linux Foundation.

slabinfo [-aABDefhilLnoPrsStTUvXz1] [N=K] [-dafzput] [slab-regexp]
-a|--aliases           Show aliases
-A|--activity          Most active slabs first
-B|--Bytes             Show size in bytes
-D|--display-active    Switch line format to activity
-e|--empty             Show empty slabs
-f|--first-alias       Show first alias
-h|--help              Show usage information
-i|--inverted          Inverted list
-l|--slabs             Show slabs
-L|--Loss              Sort by loss
-n|--numa              Show NUMA information
-N|--lines=K           Show the first K slabs
-o|--ops               Show kmem_cache_ops
-P|--partial		Sort by number of partial slabs
-r|--report            Detailed report on single slabs
-s|--shrink            Shrink slabs
-S|--Size              Sort by size
-t|--tracking          Show alloc/free information
-T|--Totals            Show summary information
-U|--Unreclaim         Show unreclaimable slabs only
-v|--validate          Validate slabs
-X|--Xtotals           Show extended summary information
......
```

## slab debug使用
### right redzone oob(out of bounds)

使用这个函数 kslub_debug_right()
编译安装 上面test case之后，主动 `sudo ./slabinfo -v` 触发合法性检查。
可以看到如下输出
```
stable_kernel@130kernel: /tmp/share/test_modules/memory/slub_debug# sudo ./slabinfo -v
[   53.423227] =============================================================================
[   53.424083] BUG kmalloc-32 (Tainted: G           O     ): Redzone overwritten
[   53.424083] -----------------------------------------------------------------------------
[   53.424083]
[   53.424083] INFO: 0x00000000de38e5d6-0x00000000de38e5d6 @offset=64. First byte 0x61 instead of 0xcc
[   53.424083] INFO: Allocated in kslub_debug_right+0x1c/0x50 [slub_debug] age=18928 cpu=2 pid=3159
[   53.424083] 	__slab_alloc+0x50/0x60
[   53.424083] 	kmem_cache_alloc_trace+0x1fb/0x230
[   53.424083] 	kslub_debug_right+0x1c/0x50 [slub_debug]
[   53.424083] 	kthread+0x10a/0x140
[   53.424083] 	ret_from_fork+0x22/0x30
[   53.424083] INFO: Freed in security_cred_free+0x37/0x50 age=18938 cpu=1 pid=0
[   53.424083] 	security_cred_free+0x37/0x50
[   53.424083] 	put_cred_rcu+0x22/0x80
[   53.424083] 	rcu_core+0x25a/0xaa0
[   53.424083] 	__do_softirq+0xc7/0x419
[   53.424083] 	asm_call_irq_on_stack+0x12/0x20
[   53.424083] 	do_softirq_own_stack+0x56/0x60
[   53.424083] 	irq_exit_rcu+0xa9/0xb0
[   53.424083] 	sysvec_apic_timer_interrupt+0x43/0xa0
[   53.424083] 	asm_sysvec_apic_timer_interrupt+0x12/0x20
[   53.424083] 	default_idle+0xe/0x10
[   53.424083] 	default_idle_call+0x63/0x1e0
[   53.424083] 	do_idle+0x1e5/0x240
[   53.424083] 	cpu_startup_entry+0x14/0x20
[   53.424083] 	secondary_startup_64_no_verify+0xc2/0xcb
[   53.424083] INFO: Slab 0x00000000831bf412 objects=19 used=18 fp=0x0000000083bc545d flags=0x100000000010201
[   53.424083] INFO: Object 0x00000000f71a6b67 @offset=32 fp=0x000000000629ace8
[   53.424083]
[   53.424083] Redzone 0000000033d4cff0: cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc  ................
[   53.424083] Redzone 00000000bf62d009: cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc  ................
[   53.424083] Object 00000000f71a6b67: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
[   53.424083] Object 00000000e9b4a4ba: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
[   53.424083] Redzone 00000000de38e5d6: 61 cc cc cc cc cc cc cc                          a.......
[   53.424083] Padding 000000002dddb492: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   53.424083] Padding 0000000010d75c56: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   53.424083] CPU: 1 PID: 3198 Comm: slabinfo Kdump: loaded Tainted: G    B      O      5.11.0-rc4+ #5
[   53.424083] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   53.424083] Call Trace:
[   53.424083]  dump_stack+0x77/0x97
[   53.424083]  check_bytes_and_report.cold+0x77/0xb4
[   53.424083]  check_object+0x193/0x250
[   53.424083]  validate_slab+0x127/0x170
[   53.424083]  validate_store+0xac/0x160
[   53.424083]  slab_attr_store+0x1b/0x30
[   53.424083]  kernfs_fop_write+0xca/0x1b0
[   53.424083]  vfs_write+0xc6/0x360
[   53.424083]  ksys_write+0x63/0xe0
[   53.424083]  do_syscall_64+0x33/0x40
[   53.424083]  entry_SYSCALL_64_after_hwframe+0x44/0xa9
[   53.424083] RIP: 0033:0x7facb81181e7
[   53.424083] Code: 64 89 02 48 c7 c0 ff ff ff ff eb bb 0f 1f 80 00 00 00 00 f3 0f 1e fa 64 8b 04 25 18 00 00 00 85 c0 75 10 b8 01 00 00 04
[   53.424083] RSP: 002b:00007ffe1b3ef6c8 EFLAGS: 00000246 ORIG_RAX: 0000000000000001
[   53.424083] RAX: ffffffffffffffda RBX: 0000000000000002 RCX: 00007facb81181e7
[   53.424083] RDX: 0000000000000002 RSI: 00005641aa82cb40 RDI: 0000000000000003
[   53.424083] RBP: 00005641aa82cb40 R08: 0000000000000000 R09: 0000000000000002
[   53.424083] R10: 00005641a899065b R11: 0000000000000246 R12: 0000000000000002
[   53.424083] R13: 00005641aa834b80 R14: 00007facb81f44a0 R15: 00007facb81f38a0
[   53.424083] FIX kmalloc-32: Restoring 0x00000000de38e5d6-0x00000000de38e5d6=0xcc
[   53.424083]
[   53.424083] =============================================================================
[   53.424083] BUG kmalloc-32 (Tainted: G    B      O     ): Redzone overwritten
[   53.424083] -----------------------------------------------------------------------------
```

可以看到开启 slub_debug 之后内存布局是
```
[   53.424083] Redzone 0000000033d4cff0: cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc  ................
[   53.424083] Redzone 00000000bf62d009: cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc  ................
[   53.424083] Object 00000000f71a6b67: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
[   53.424083] Object 00000000e9b4a4ba: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
[   53.424083] Redzone 00000000de38e5d6: 61 cc cc cc cc cc cc cc                          a.......
[   53.424083] Padding 000000002dddb492: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   53.424083] Padding 0000000010d75c56: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
```

在分配之后（未使用GFP_ZREO mask），object的内容都是 `6b`, 最后一个字节是`a5`，其余 redzone 的地方都是填充了`cc`，最后padding的位置填充了 `5a`，这些`magic num` 其实都是在分配的时候assign的。
先看各个`magic num`定义，在 `include/linux/poison.h` 中
```
/********** mm/slab.c **********/
/*
 * Magic nums for obj red zoning.
 * Placed in the first word before and the first word after an obj.
 */
#define	RED_INACTIVE	0x09F911029D74E35BULL	/* when obj is inactive */
#define	RED_ACTIVE	0xD84156C5635688C0ULL	/* when obj is active */

#define SLUB_RED_INACTIVE	0xbb
#define SLUB_RED_ACTIVE		0xcc

/* ...and for poisoning */
#define	POISON_INUSE	0x5a	/* for use-uninitialised poisoning */
#define POISON_FREE	0x6b	/* for use-after-free poisoning */
#define	POISON_END	0xa5	/* end-byte of poisoning */
```

实现主要参考 `mm/slub.c` 中代码
```
static int check_slab(struct kmem_cache *s, struct page *page)
{
	int maxobj;

	VM_BUG_ON(!irqs_disabled());

	if (!PageSlab(page)) {
		slab_err(s, page, "Not a valid slab page");
		return 0;
	}

	maxobj = order_objects(compound_order(page), s->size);
	if (page->objects > maxobj) {
		slab_err(s, page, "objects %u > max %u",
			page->objects, maxobj);
		return 0;
	}
	if (page->inuse > page->objects) {
		slab_err(s, page, "inuse %u > max %u",
			page->inuse, page->objects);
		return 0;
	}
	/* Slab_pad_check fixes things up after itself */
	slab_pad_check(s, page);
	return 1;
}

static void init_object(struct kmem_cache *s, void *object, u8 val)
{
	u8 *p = kasan_reset_tag(object);

	if (s->flags & SLAB_RED_ZONE)
		memset(p - s->red_left_pad, val, s->red_left_pad);

	if (s->flags & __OBJECT_POISON) {
		memset(p, POISON_FREE, s->object_size - 1);
		p[s->object_size - 1] = POISON_END;
	}

	if (s->flags & SLAB_RED_ZONE)
		memset(p + s->object_size, val, s->inuse - s->object_size);
}

static noinline int alloc_debug_processing(struct kmem_cache *s,
					struct page *page,
					void *object, unsigned long addr)
{
	init_object(s, object, SLUB_RED_ACTIVE);
	return 1;
}

static noinline int free_debug_processing(
	struct kmem_cache *s, struct page *page,
	void *head, void *tail, int bulk_cnt,
	unsigned long addr)
{
    if (s->flags & SLAB_CONSISTENCY_CHECKS) {
		if (!check_slab(s, page))
			goto out;
	}
    init_object(s, object, SLUB_RED_INACTIVE);
}
```
`check_slab()` 主要用来检查`slab`合法性
`init_object()` 主要用来填充`magic num`
`alloc_debug_processing()` 和 `free_debug_processing()` 会hook在slab分配与释放的路径上，达到对所有 slab 对象分配和释放过程中`检查是否越界` 和 `填充magic num`的目的。

但是有时候有些slab申请之后，很久之后才会释放，甚至在整个内核生命周期内都不会释放，那通过 `free_debug_processing` 这个代码路径就无法执行，就没法检查是否越界了吗？
显然不是，这就是`slabinfo -v`的作用，他最后会调用到内核函数`validate_slab()`
```
#ifdef CONFIG_SLUB_DEBUG
static void validate_slab(struct kmem_cache *s, struct page *page)
{
	void *p;
	void *addr = page_address(page);
	unsigned long *map;

	slab_lock(page);

	if (!check_slab(s, page) || !on_freelist(s, page, NULL))
		goto unlock;
    ......
}
```

### left redzone oob(out of bounds)
使用 kslub_debug_left()
同样编译安装之后，可以 使用`slabinfo -v`触发检查
```
stable_kernel@kernel: /tmp/share/test_modules/memory/slub_debug# sudo slabinfo -v
[   88.049885] =============================================================================
[   88.050661] BUG kmalloc-32 (Tainted: G           O     ): Redzone overwritten
[   88.050661] -----------------------------------------------------------------------------
[   88.050661]
[   88.050661] INFO: 0x00000000f7a64828-0x00000000f7a64828 @offset=30. First byte 0x61 instead of 0xcc
[   88.050661] INFO: Allocated in kslub_debug_left+0x1c/0x50 [slub_debug] age=8012 cpu=2 pid=3207
......
[   88.050661] INFO: Slab 0x00000000736d0bf0 objects=19 used=13 fp=0x0000000001a78134 flags=0x100000000010201
[   88.050661] INFO: Object 0x00000000a9f17fea @offset=32 fp=0x00000000ec20872a
[   88.050661]
[   88.050661] Redzone 000000003a38622f: cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc cc  ................
[   88.050661] Redzone 000000006a2f8e0a: cc cc cc cc cc cc cc cc cc cc cc cc cc cc 61 cc  ..............a.
[   88.050661] Object 00000000a9f17fea: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
[   88.050661] Object 00000000cc601ad9: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
[   88.050661] Redzone 0000000050c2e0d4: cc cc cc cc cc cc cc cc                          ........
[   88.050661] Padding 000000009487d314: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   88.050661] Padding 000000008d823823: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   88.050661] CPU: 3 PID: 3212 Comm: slabinfo Kdump: loaded Tainted: G    B      O      5.11.0-rc4+ #5
```

可以从输出看到原因
```
[   88.050661] BUG kmalloc-32 (Tainted: G           O     ): Redzone overwritten
[   88.050661] INFO: 0x00000000f7a64828-0x00000000f7a64828 @offset=30. First byte 0x61 instead of 0xcc
```


### use after free
使用 kslub_debug_use_after_free()
同样编译安装之后，可以 使用`slabinfo -v`触发检查
```
[   43.801344] =============================================================================
[   43.802065] BUG kmalloc-32 (Tainted: G           O     ): Poison overwritten
[   43.802065] -----------------------------------------------------------------------------
[   43.802065]
[   43.802065] INFO: 0x0000000065d12e59-0x0000000065d12e59 @offset=3806. First byte 0x61 instead of 0x6b
[   43.802065] INFO: Allocated in kslub_debug_use_after_free+0x4e/0xc0 [slub_debug] age=8 cpu=1 pid=3163
[   43.802065] 	__slab_alloc+0x50/0x60
[   43.802065] 	kmem_cache_alloc_trace+0x1fb/0x230
[   43.802065] 	kslub_debug_use_after_free+0x4e/0xc0 [slub_debug]
[   43.802065] 	kthread+0x10a/0x140
[   43.802065] 	ret_from_fork+0x22/0x30
[   43.802065] INFO: Freed in kslub_debug_use_after_free+0x6a/0xc0 [slub_debug] age=8 cpu=1 pid=3163
[   43.802065] 	kslub_debug_use_after_free+0x6a/0xc0 [slub_debug]
[   43.802065] 	kthread+0x10a/0x140
[   43.802065] 	ret_from_fork+0x22/0x30
[   43.802065] INFO: Slab 0x0000000091c90915 objects=19 used=19 fp=0x0000000000000000 flags=0x100000000010200
[   43.802065] INFO: Object 0x000000002c0fb46b @offset=3776 fp=0x00000000d32afce7
[   43.802065]
[   43.802065] Redzone 000000007de0fb38: bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb  ................
[   43.802065] Redzone 0000000010d06595: bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb  ................
[   43.802065] Object 000000002c0fb46b: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
[   43.802065] Object 000000008ffb8d24: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 61 a5  kkkkkkkkkkkkkka.
[   43.802065] Redzone 00000000f5b8c2fa: bb bb bb bb bb bb bb bb                          ........
[   43.802065] Padding 000000007af7da7c: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   43.802065] Padding 000000002d26610c: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   43.802065] FIX kmalloc-32: Restoring 0x0000000065d12e59-0x0000000065d12e59=0x6b
[   43.802065]
[   43.802065] FIX kmalloc-32: Marking all objects used
```

可以从输出看到原因
```
[   43.802065] BUG kmalloc-32 (Tainted: G           O     ): Poison overwritten
[   43.802065] INFO: 0x0000000065d12e59-0x0000000065d12e59 @offset=3806. First byte 0x61 instead of 0x6b
```
可以发现 free 状态的 `slab object` 的 `redzone` 填充的是 `bb` 与使用中的`cc`不一样，其次 padding还是`5a`。









### double free
使用 kslub_debug_double_free()
同样编译安装之后
```
[   99.126747] =============================================================================
[   99.128946] BUG kmalloc-32 (Tainted: G    B      O     ): Object already free
[   99.128946] -----------------------------------------------------------------------------
[   99.128946]
[   99.128946] INFO: Allocated in kslub_debug_double_free+0x4e/0xd0 [slub_debug] age=1517 cpu=1 pid=3402
[   99.128946] 	__slab_alloc+0x50/0x60
[   99.128946] 	kmem_cache_alloc_trace+0x1fb/0x230
[   99.128946] 	kslub_debug_double_free+0x4e/0xd0 [slub_debug]
[   99.128946] 	kthread+0x10a/0x140
[   99.128946] 	ret_from_fork+0x22/0x30
[   99.128946] INFO: Freed in kslub_debug_double_free+0x6b/0xd0 [slub_debug] age=1207 cpu=1 pid=3402
[   99.128946] 	kslub_debug_double_free+0x6b/0xd0 [slub_debug]
[   99.128946] 	kthread+0x10a/0x140
[   99.128946] 	ret_from_fork+0x22/0x30
[   99.128946] INFO: Slab 0x000000004358aee6 objects=19 used=16 fp=0x000000007cc439c4 flags=0x100000000010201
[   99.128946] INFO: Object 0x000000007cc439c4 @offset=5856 fp=0x0000000000000000
[   99.128946]
[   99.128946] Redzone 000000008f8c9766: bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb  ................
[   99.128946] Redzone 00000000ad0c3fcc: bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb bb  ................
[   99.128946] Object 000000007cc439c4: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
[   99.128946] Object 00000000b15b51a4: 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
[   99.128946] Redzone 000000009f473013: bb bb bb bb bb bb bb bb                          ........
[   99.128946] Padding 00000000cb92dccb: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   99.128946] Padding 000000006bc8c5e0: 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a 5a  ZZZZZZZZZZZZZZZZ
[   99.128946] CPU: 1 PID: 3402 Comm: kslub_debug Kdump: loaded Tainted: G    B      O      5.11.0-rc4+ #5
[   99.128946] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[   99.128946] Call Trace:
[   99.128946]  dump_stack+0x77/0x97
[   99.128946]  free_debug_processing.cold+0x10c/0x14f
[   99.128946]  __slab_free+0x286/0x490
[   99.128946]  ? schedule_timeout+0x1bf/0x370
[   99.128946]  ? trace_hardirqs_on+0x1b/0xd0
[   99.128946]  kslub_debug_double_free+0x86/0xd0 [slub_debug]
[   99.128946]  ? kslub_debug_double_free.part.0+0x20/0x20 [slub_debug]
[   99.128946]  kthread+0x10a/0x140
[   99.128946]  ? kthread_park+0x80/0x80
[   99.128946]  ret_from_fork+0x22/0x30
[   99.160092] FIX kmalloc-32: Object at 0x000000007cc439c4 not freed
```

可以从输出看到原因
```
[   99.128946] BUG kmalloc-32 (Tainted: G    B      O     ): Object already free
```
`double free`的问题会直接在 第二次 free的时候打印出日志，不需要`slabinfo -v`去触发

## slubinfo 其他用处
`slabinfo -t` 可以跟踪 `slab` 内存分配释放
`slabinfo -A` 显示 alias 信息
`slabinfo -T` 显示 total 信息
```
stable_kernel@kernel: /var/crash# sudo slabinfo -T
Slabcache Totals
----------------
Slabcaches :             220   Aliases  :           0->0    Active:    117
Memory used:          211.2M   # Loss   :          112.7M   MRatio:   114%
# Objects  :          265.6K   # PartObj:           17.7K   ORatio:     6%

Per Cache         Average              Min              Max            Total
----------------------------------------------------------------------------
#Objects             2.2K                1            39.8K           265.6K
#Slabs                185                1             3.3K            21.7K
#PartSlab              16                1              347             1.9K
%PartSlab             56%               0%             100%               9%
PartObjs                6                0             3.8K            17.7K
% PartObj             53%               0%             100%               6%
Memory               1.8M             4.0K            27.1M           211.2M
Used               841.8K               32            22.7M            98.4M
Loss               964.0K             4.0K            14.7M           112.7M

Per Object        Average              Min              Max
-----------------------------------------------------------
Memory                742              344            24.5K
User                  370                8             8.1K
Loss                  372              336            16.3K
```


## slub_debug overhead

从 `slub debug` 原理上看，主要有以下几点 overhead:
1. 需要额外空间去放 `redzone`等为了debug而额外添加的一些字段
2. 需要在 `kmalloc` `kfree` 等关键路径上hook 设置、检查 magic num的代码
其他倒没有很大的overhead

使用公司开发板做一下对比（单核 cortex-A7芯片）
```
memory  on      	off
free	105224K		57992K


cpu     on      off
usr	4.1	5.5
sys	19.8	11.1
idle	75.3	82.2

loadavg on      off
1	2.91	1.14
5	1.13	0.29
15	0.41	0.10
```
可以看到 `slub_debug` 特性大概占用了7% CPU。
free内存少了一半，当然，这是个小内存系统，内存只有211Mb。
loadavg 也上升了许多，没有去看 `sar -B 1` 相关指标，应该也出现了不少直接内存回收。


## 总结
从overall的角度来说，`slub debug` 通过在 `kmalloc` `kfree`的路径上hook了设置和检查 magic num的方式，可以很有效的排查：
1. 内存使用越界
2. 内存use after free
3. double free
这三类问题


参考 [wowo 文章1](http://www.wowotech.net/memory_management/427.html)
参考 [wowo 文章2](http://www.wowotech.net/memory_management/426.html)
