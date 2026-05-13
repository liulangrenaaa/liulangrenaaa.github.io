---
title: pagemap
date: 2021-02-04 19:00:40
tags:
    - pagemap
categories:
    - linux内核
---


## 简介
`pagemap` 是 an array mapping virtual pages to pfns，就是一组mapping，是虚拟地址到pfn的一个mapping 映射，是相对于一个进程地址空间来说的。

```
 * /proc/pid/pagemap - an array mapping virtual pages to pfns
 *
 * For each page in the address space, this file contains one 64-bit entry
 * consisting of the following:
 *
 * Bits 0-54  page frame number (PFN) if present
 * Bits 0-4   swap type if swapped
 * Bits 5-54  swap offset if swapped
 * Bit  55    pte is soft-dirty (see Documentation/admin-guide/mm/soft-dirty.rst)
 * Bit  56    page exclusively mapped
 * Bits 57-60 zero
 * Bit  61    page is file-page or shared-anon
 * Bit  62    page swapped
 * Bit  63    page present
 *
 * If the page is not present but in swap, then the PFN contains an
 * encoding of the swap file number and the page's offset into the
 * swap. Unmapped pages return a null PFN. This allows determining
 * precisely which pages are mapped (or in swap) and comparing mapped
 * pages between processes.
 *
 * Efficient users of this interface will use /proc/pid/maps to
 * determine which areas of memory are actually mapped and llseek to
 * skip over unmapped regions.
```

这是 `fs/proc/task_mmu.c` 中 `pagemap_read`函数的注释。
可以看到比较重要是
```
 * Bit  62    page swapped
 * Bit  63    page present
```



## code

在 kernel 代码中搜索 `/proc/self/pagemap` 字符，可以看到在 `tools/testing/selftests/vm/madv_populate.c`目录中有较多使用了 pagemap这个文件。

在 `test_modules` 这个[仓库中](https://github.com/liulangrenaaa/test_modules/blob/main/memory/pagemap/main.c) 可以看到相关使用 `/proc/self/pagemap` 的代码。

代码通过 `mmap` `malloc` `calloc` 之后得到的地址来判断这个地址是否映射了物理页帧，还可以获得映射后的物理页帧号，运行之后结果是
```
ubuntu@zeku_root:/home/ubuntu/workspace/share/test_modules/memory/pagemap # ./main
[test_mmap]: addr = 0x8d6d5000
start = 0x8d6d5000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6d5000 is not populated
start = 0x8d6d6000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6d6000 is not populated
start = 0x8d6d7000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6d7000 is not populated
start = 0x8d6d8000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6d8000 is not populated
start = 0x8d6d9000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6d9000 is not populated
start = 0x8d6da000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6da000 is not populated
start = 0x8d6db000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6db000 is not populated
start = 0x8d6dc000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6dc000 is not populated
start = 0x8d6dd000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6dd000 is not populated
start = 0x8d6de000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6de000 is not populated
start = 0x8d6df000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6df000 is not populated
start = 0x8d6e0000, entry = 0x0080000000000000
[test_mmap]: addr: 0x8d6e0000 is not populated
[test_mmap]: memset
start = 0x8d6d5000, entry = 0x81800000002c53d6
start = 0x8d6d6000, entry = 0x818000000026072d
start = 0x8d6d7000, entry = 0x81800000002851f6
start = 0x8d6d8000, entry = 0x81800000002e3a6d
start = 0x8d6d9000, entry = 0x818000000036297a
start = 0x8d6da000, entry = 0x81800000003ff422
start = 0x8d6db000, entry = 0x81800000001f0a10
start = 0x8d6dc000, entry = 0x81800000002e3b2c
start = 0x8d6dd000, entry = 0x81800000003c8e7c
start = 0x8d6de000, entry = 0x8180000000347f7f
start = 0x8d6df000, entry = 0x8180000000293003
start = 0x8d6e0000, entry = 0x81800000002a69ae
[test_malloc]: addr = 0x863056b0
start = 0x863056b0, entry = 0x81800000003f4906
start = 0x863066b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863066b0 is not populated
start = 0x863076b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863076b0 is not populated
start = 0x863086b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863086b0 is not populated
start = 0x863096b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863096b0 is not populated
start = 0x8630a6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630a6b0 is not populated
start = 0x8630b6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630b6b0 is not populated
start = 0x8630c6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630c6b0 is not populated
start = 0x8630d6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630d6b0 is not populated
start = 0x8630e6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630e6b0 is not populated
start = 0x8630f6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630f6b0 is not populated
start = 0x863106b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863106b0 is not populated
[test_malloc]: memset 1 / 3
start = 0x863056b0, entry = 0x81800000003f4906
start = 0x863066b0, entry = 0x81800000003ff7c3
start = 0x863076b0, entry = 0x81800000003ff592
start = 0x863086b0, entry = 0x8180000000325293
start = 0x863096b0, entry = 0x8180000000215ef7
start = 0x8630a6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630a6b0 is not populated
start = 0x8630b6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630b6b0 is not populated
start = 0x8630c6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630c6b0 is not populated
start = 0x8630d6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630d6b0 is not populated
start = 0x8630e6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630e6b0 is not populated
start = 0x8630f6b0, entry = 0x0080000000000000
[test_malloc]: addr:0x8630f6b0 is not populated
start = 0x863106b0, entry = 0x0080000000000000
[test_malloc]: addr:0x863106b0 is not populated
[test_calloc]: addr = 0x863116c0
start = 0x863116c0, entry = 0x818000000040bcb7
start = 0x863126c0, entry = 0x8180000000293f9f
start = 0x863136c0, entry = 0x8180000000316b40
start = 0x863146c0, entry = 0x81800000002e30dd
start = 0x863156c0, entry = 0x81800000002e2dcd
start = 0x863166c0, entry = 0x818000000030dd5c
start = 0x863176c0, entry = 0x81800000002352b5
start = 0x863186c0, entry = 0x81800000001d4da4
start = 0x863196c0, entry = 0x818000000033e5c1
start = 0x8631a6c0, entry = 0x8180000000184f31
start = 0x8631b6c0, entry = 0x818000000039d867
start = 0x8631c6c0, entry = 0x81800000002e1a05
[test_malloc]: memset
start = 0x863116c0, entry = 0x818000000040bcb7
start = 0x863126c0, entry = 0x8180000000293f9f
start = 0x863136c0, entry = 0x8180000000316b40
start = 0x863146c0, entry = 0x81800000002e30dd
start = 0x863156c0, entry = 0x81800000002e2dcd
start = 0x863166c0, entry = 0x818000000030dd5c
start = 0x863176c0, entry = 0x81800000002352b5
start = 0x863186c0, entry = 0x81800000001d4da4
start = 0x863196c0, entry = 0x818000000033e5c1
start = 0x8631a6c0, entry = 0x8180000000184f31
start = 0x8631b6c0, entry = 0x818000000039d867
start = 0x8631c6c0, entry = 0x81800000002e1a05
ubuntu@zeku_root:/home/ubuntu/workspace/share/test_modules/memory/pagemap #
```