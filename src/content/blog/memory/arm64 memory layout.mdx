---
title: arm64 memory layout
date: 2022-07-01 19:00:40
tags:
    - mm
    - arm64
    - memory layout
categories:
    - linux内核
slug: "memory/arm64-memory-layout"
---



## arm64 支持的虚拟地址位数
AArch64 Linux通常使用以下配置：
1. 4KB页面， 使用3级或4级转换表，支持39位（512GB）或48位（256TB）的虚拟地址。
2. 64KB页面，使用2级转换表，支持42位（4TB）虚拟地址。
```
                             PAGE_SIZE             PAGE_SHIFT       PTE_SHIFT       PMD_SHIFT       VA_BITS      PGTABLE_LEVELS
ARM64_4K_PAGES        4K  == 2^12 == 2^2 * 2^10       12               4               4               48             4
ARM64_64K_PAGES       64K == 2^16 == 2^6 * 2^10       16               5               5               42             3
```

参考 `arch/arm64/Kconfig` 中
```
config ARM64_PAGE_SHIFT
	int
	default 16 if ARM64_64K_PAGES
	default 14 if ARM64_16K_PAGES
	default 12

config ARM64_CONT_PTE_SHIFT
	int
	default 5 if ARM64_64K_PAGES
	default 7 if ARM64_16K_PAGES
	default 4

config ARM64_CONT_PMD_SHIFT
	int
	default 5 if ARM64_64K_PAGES
	default 5 if ARM64_16K_PAGES
	default 4

config ARCH_MMAP_RND_BITS_MIN
	default 14 if ARM64_64K_PAGES
	default 16 if ARM64_16K_PAGES
	default 18

......

config PGTABLE_LEVELS
	int
	default 2 if ARM64_16K_PAGES && ARM64_VA_BITS_36
	default 2 if ARM64_64K_PAGES && ARM64_VA_BITS_42
	default 3 if ARM64_64K_PAGES && (ARM64_VA_BITS_48 || ARM64_VA_BITS_52)
	default 3 if ARM64_4K_PAGES && ARM64_VA_BITS_39
	default 3 if ARM64_16K_PAGES && ARM64_VA_BITS_47
	default 4 if !ARM64_64K_PAGES && ARM64_VA_BITS_48

......


choice
	prompt "Page size"
	default ARM64_4K_PAGES
	help
	  Page size (translation granule) configuration.

config ARM64_4K_PAGES
	bool "4KB"
	help
	  This feature enables 4KB pages support.

config ARM64_16K_PAGES
	bool "16KB"
	help
	  The system will use 16KB pages support. AArch32 emulation
	  requires applications compiled with 16K (or a multiple of 16K)
	  aligned segments.

config ARM64_64K_PAGES
	bool "64KB"
	help
	  This feature enables 64KB pages support (4KB by default)
	  allowing only two levels of page tables and faster TLB
	  look-up. AArch32 emulation requires applications compiled
	  with 64K aligned segments.

endchoice

......

choice
	prompt "Virtual address space size"
	default ARM64_VA_BITS_39 if ARM64_4K_PAGES
	default ARM64_VA_BITS_47 if ARM64_16K_PAGES
	default ARM64_VA_BITS_42 if ARM64_64K_PAGES
	help
	  Allows choosing one of multiple possible virtual address
	  space sizes. The level of translation table is determined by
	  a combination of page size and virtual address space size.

......


config ARM64_VA_BITS_39
	bool "39-bit"
	depends on ARM64_4K_PAGES

config ARM64_VA_BITS_42
	bool "42-bit"
	depends on ARM64_64K_PAGES

config ARM64_VA_BITS_47
	bool "47-bit"
	depends on ARM64_16K_PAGES
```


原本 kernel 在 bootup阶段会打印虚拟内存的布局，后续已经删除参考 patch
```
commit 071929dbdd865f779a89ba3f1e06ba8d17dd3743
Author: Laura Abbott <labbott@redhat.com>
Date:   Tue Dec 19 11:28:10 2017 -0800

    arm64: Stop printing the virtual memory layout

    Printing kernel addresses should be done in limited circumstances, mostly
    for debugging purposes. Printing out the virtual memory layout at every
    kernel bootup doesn't really fall into this category so delete the prints.
    There are other ways to get the same information.
```

## 4K page
以4K Page为例
`User addresses have bits 63:48 set to 0 while the kernel addresses have the same bits set to 1.`
userspace都在低地址，kernelspace都在高地址。

`virtual memory space layout`
```
 Start                 End                     Size            Use
 -----------------------------------------------------------------------
 0000000000000000      0000ffffffffffff         256TB          user
 ffff000000000000      ffff7fffffffffff         128TB          kernel logical memory map
[ffff600000000000      ffff7fffffffffff]         32TB          [kasan shadow region]
 ffff800000000000      ffff800007ffffff         128MB          modules
 ffff800008000000      fffffbffefffffff         124TB          vmalloc
 fffffbfff0000000      fffffbfffdffffff         224MB          fixed mappings (top down)
 fffffbfffe000000      fffffbfffe7fffff           8MB          [guard region]
 fffffbfffe800000      fffffbffff7fffff          16MB          PCI I/O space
 fffffbffff800000      fffffbffffffffff           8MB          [guard region]
 fffffc0000000000      fffffdffffffffff           2TB          vmemmap
 fffffe0000000000      ffffffffffffffff           2TB          [guard region]
```


`Translation table lookup with 4KB pages`
```
+--------+--------+--------+--------+--------+--------+--------+--------+
|63    56|55    48|47    40|39    32|31    24|23    16|15     8|7      0|
+--------+--------+--------+--------+--------+--------+--------+--------+
 |                 |         |         |         |         |
 |                 |         |         |         |         v
 |                 |         |         |         |   [11:0]  in-page offset - 12
 |                 |         |         |         +-> [20:12] L3 index ------- 9
 |                 |         |         +-----------> [29:21] L2 index ------- 9
 |                 |         +---------------------> [38:30] L1 index ------- 9
 |                 +-------------------------------> [47:39] L0 index ------- 9
 +-------------------------------------------------> [63] TTBR0/1
```























参考[arm64内核内存布局](https://blog.csdn.net/yhb1047818384/article/details/104621500)
参考[Memory Layout on AArch64 Linux](https://www.kernel.org/doc/html/latest/arm64/memory.html)
参考[]()
参考[]()


