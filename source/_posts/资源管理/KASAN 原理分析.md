---
title: KASAN 原理分析
date: 2021-01-27 19:00:00
tags:
    - KASAN
categories:
    - linux内核
---



## 原理


granule size == 8
tags num == 2^8 == 256

















## 代码实现分析

### tag 有哪些，怎么产生的
kernel 认为 `0xFF` 的tag 都是有效的，将不可访问的内存都标记为 `0xFE`，认为是无效的。
在不使能 `CONFIG_KASAN_HW_TAGS` 特性下，最小的 TAG是 `0x00`；使能情况下（只有aarch64支持），最小的 TAG是 `0xF0`。
```
#define KASAN_TAG_KERNEL	0xFF /* native kernel pointers tag */
#define KASAN_TAG_INVALID	0xFE /* inaccessible memory tag */
#define KASAN_TAG_MAX		0xFD /* maximum value for random tags */

#ifdef CONFIG_KASAN_HW_TAGS
#define KASAN_TAG_MIN		0xF0 /* minimum value for random tags */
#else
#define KASAN_TAG_MIN		0x00 /* minimum value for random tags */
#endif
```


通过 `kasan_random_tag` 可以随机产生一个tag val
```
u8 kasan_random_tag(void)
{
	u32 state = this_cpu_read(prng_state);

	state = 1664525 * state + 1013904223;
	this_cpu_write(prng_state, state);

	return (u8)(state % (KASAN_TAG_MAX + 1));
}
```



### kasan hook点做了啥

kasan_kmalloc

kasan_kfree



















## MTE
MTE 是一种内存错误检测工具，或者至少是硬件加速工具。
第一个实现类似功能的硬件架构 是 `SPARCE`，







## HWKASAN


















参考[KASAN 原理解释](https://www.youtube.com/watch?v=9wRT2hNwbkA&list=PL7naqTyjyDvBj7dcaTcNp5QSPArZAImv2&index=3&ab_channel=AndreyKonovalov)

参考[MTE HWKASAN 原理解释](https://www.youtube.com/watch?v=UwMt0e_dC_Q&list=PL7naqTyjyDvBj7dcaTcNp5QSPArZAImv2&index=6&ab_channel=AndreyKonovalov)

参考[MTE 是什么](https://www.youtube.com/watch?v=qzQNoYwcH2g&ab_channel=Arm%C2%AE)


