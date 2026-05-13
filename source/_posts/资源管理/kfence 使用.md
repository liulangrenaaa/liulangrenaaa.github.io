---
title: kfence 使用
date: 2021-06-11 19:00:00
tags:
    - 内核内存越界
    - use after free
    - double free
    - kfence
categories:
    - linux内核
---


## Kfence 配置
看下`.config`的改变

```
ubuntu@zeku_server:~/workspace/linux $ diff ./out/.config /tmp/.config
4713c4713,4717
< # CONFIG_KFENCE is not set
---
> CONFIG_KFENCE=y
> CONFIG_KFENCE_STATIC_KEYS=y
> CONFIG_KFENCE_SAMPLE_INTERVAL=100
> CONFIG_KFENCE_NUM_OBJECTS=255
> CONFIG_KFENCE_STRESS_TEST_FAULTS=0
```

## Kfence 使用

写了一个test case，参考[代码](https://github.com/liulangrenaaa/test_modules/blob/main/memory/kfence/kfence_debug.c)


### oob检测

```
static int kfence_debug_oob(void *data)
{
	char *p[100] = {NULL, };
	int i = 0;
	data = data;

	msleep(1000 * 5);
	for (i = 0; i < 10; i++) {
		p[i] = (char *)kmalloc(32, GFP_KERNEL);
		p[i][32] = 'a';
	}

	while(!kthread_should_stop()) {
		msleep_interruptible(1000);
	}
	return 1;
}
```
主要就是越界写了 1byte的 kmalloc数据。

insmod 之后立刻报错
```
[  779.341929] kfence_debug: loading out-of-tree module taints kernel.
[  784.638024] ==================================================================
[  784.641414] BUG: KFENCE: out-of-bounds write in kfence_debug_oob+0x26/0x60 [kfence_debug]

[  784.643513] Out-of-bounds write at 0x00000000514f5e22 (32B right of kfence-#176):
[  784.644142]  kfence_debug_oob+0x26/0x60 [kfence_debug]
[  784.644144]  kthread+0xf9/0x130
[  784.644146]  ret_from_fork+0x22/0x30

[  784.644283] kfence-#176 [0x000000001f204f03-0x00000000533650da, size=32, cache=kmalloc-32] allocated by task 3757:
[  784.644288]  kfence_debug_oob+0x26/0x60 [kfence_debug]
[  784.644289]  kthread+0xf9/0x130
[  784.644290]  ret_from_fork+0x22/0x30

[  784.644423] CPU: 2 PID: 3757 Comm: kfence_debug Kdump: loaded Tainted: G           O      5.13.0-rc5+ #4
[  784.645207] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[  784.646006] ==================================================================
```

`oob` 的 代码堆栈直接也打印出来了，十分清晰


### use after free 检测

```
static int kfence_debug_use_after_free(void *data)
{
	char *p[100] = {NULL, };
	int i = 0;
	data = data;

	msleep(1000 * 5);
	for (i = 0; i < 10; i++) {
		p[i] = (char *)kmalloc(32, GFP_KERNEL);
		p[i][30] = 'a';
	}

	for (i = 0; i < 10; i++) {
		kfree(p[i]);
		msleep_interruptible(100);
		p[i][30] = 'a';
	}

	while(!kthread_should_stop()) {
		msleep_interruptible(1000);
	}
	return 1;
}
```
user after free:
 + kmalloc 32 bytes mem => p
 + assign val to p[30]
 + free p
 + assign val to p[30]

insmod 之后立刻报错
```
[ 1779.536493] ==================================================================
[ 1779.539850] BUG: KFENCE: use-after-free write in kfence_debug_use_after_free+0x7e/0xd0 [kfence_debug]

[ 1779.542427] Use-after-free write at 0x0000000013fef528 (in kfence-#218):
[ 1779.542985]  kfence_debug_use_after_free+0x7e/0xd0 [kfence_debug]
[ 1779.542987]  kthread+0xf9/0x130
[ 1779.542990]  ret_from_fork+0x22/0x30

[ 1779.543123] kfence-#218 [0x000000007dc7fe8d-0x0000000000dd0a85, size=32, cache=kmalloc-32] allocated by task 3868:
[ 1779.543127]  kfence_debug_use_after_free+0x58/0xd0 [kfence_debug]
[ 1779.543129]  kthread+0xf9/0x130
[ 1779.543130]  ret_from_fork+0x22/0x30
[ 1779.543131]
               freed by task 3868:
[ 1779.543133]  kthread+0xf9/0x130
[ 1779.543134]  ret_from_fork+0x22/0x30

[ 1779.543266] CPU: 1 PID: 3868 Comm: kfence_debug Kdump: loaded Tainted: G    B      O      5.13.0-rc5+ #4
[ 1779.544051] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[ 1779.544818] ==================================================================
```

可以看出这是一个 `kmalloc-32` 的 mem，且是 `allocated` by task 3868，`freed` by task 3868。
也可以看到详细堆栈。


### double free 检测

```
static int kfence_debug_double_free(void *data)
{
	char *p[100] = {NULL, };
	int i = 0;
	data = data;

	msleep(1000 * 5);
	for (i = 0; i < 10; i++) {
		p[i] = (char *)kmalloc(32, GFP_KERNEL);
		p[i][30] = 'a';
	}

	for (i = 0; i < 10; i++) {
		kfree(p[i]);
		msleep_interruptible(100);
	}

	for (i = 0; i < 10; i++) {
		kfree(p[i]);
		msleep_interruptible(100);
	}

	while(!kthread_should_stop()) {
		msleep_interruptible(1000);
	}

	return 1;
}
```
double free:
 + kmalloc 32 bytes mem => p
 + free p
 + free p

insmod 之后立刻报错
```
[ 2489.576810] ==================================================================
[ 2489.577668] BUG: KFENCE: invalid free in kthread+0xf9/0x130

[ 2489.578464] Invalid free of 0x00000000ed008e01 (in kfence-#160):
[ 2489.579128]  kthread+0xf9/0x130
[ 2489.579131]  ret_from_fork+0x22/0x30

[ 2489.579305] kfence-#160 [0x00000000ed008e01-0x0000000086ffed42, size=32, cache=kmalloc-32] allocated by task 3914:
[ 2489.579310]  kfence_debug_double_free+0x58/0xd0 [kfence_debug]
[ 2489.579312]  kthread+0xf9/0x130
[ 2489.579313]  ret_from_fork+0x22/0x30
[ 2489.579315]
               freed by task 3914:
[ 2489.579318]  kthread+0xf9/0x130
[ 2489.579319]  ret_from_fork+0x22/0x30

[ 2489.579492] CPU: 3 PID: 3914 Comm: kfence_debug Kdump: loaded Tainted: G    B      O      5.13.0-rc5+ #4
[ 2489.580590] Hardware name: QEMU Standard PC (i440FX + PIIX, 1996), BIOS 1.13.0-1ubuntu1.1 04/01/2014
[ 2489.581698] ==================================================================
```

可以看出这是一个 `kmalloc-32` 的 mem，且是 `allocated` by task 3914, `freed` by task 3914。
也可以看到详细堆栈。





## Kfence 原理


