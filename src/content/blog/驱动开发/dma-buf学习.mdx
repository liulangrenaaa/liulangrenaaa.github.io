---
title: dma-buf学习
date: 2024-10-14 19:00:00
tags:
    - device drivers
    - dma-buf
categories:
    - linux内核
slug: "驱动开发/dma-buf学习"
---



# 介绍
为此kernel引入了DMA-BUF这个框架（或者说是子系统），来解决CPU和各种不同外设驱动之间buffer共享的问题。

+ 其中Dma buffer是一块允许在CPU和其他子系统或各种IO外设间共享的buffer。
+ 而DMA-BUF是这个buffer的描述和使用框架。框架提供了对dma-buffer的描述结构体，和基于file的dma-buf使用接口，同时完成了操作时刷cache的动作。

也就是说为了实现buffer的共享，DMA-BUF将buffer与file关联起来，通过file来间接的引用和共享buffer， 即 dma-buf 既是块物理 buffer，又是个 linux file。buffer 是内容，file 是媒介，只有通过 file 这个媒介才能实现同一 buffer 在不同驱动之间的流转。

参考[201_DMA-BUF简单介绍](https://blog.csdn.net/u011795345/article/details/129306630)

DMA-BUF：一个用于共享 DMA 缓冲区的内核框架，使得不同设备驱动程序可以高效地共享缓冲区，避免数据复制。
类似于android中的ion内存


## android 已经全面转向 dma-buf
在 Android 12 中，GKI 2.0 将 ION 分配器替换为了 DMA-BUF 堆，原因如下：

安全性：由于每个 DMA-BUF 堆都是一台单独的字符设备，因此可以通过 sepolicy 单独控制对每个堆的访问权限。这对于 ION 而言是不可能的，因为从任何堆进行分配只需要访问 /dev/ion 设备。
ABI 稳定性：与 ION 不同，DMA-BUF 堆框架的 IOCTL 接口肯定具有稳定的 ABI，因为它是在上游 Linux 内核中维护的。
标准化：DMA-BUF 堆框架提供了一个明确定义的 UAPI。ION 允许使用自定义标志和堆 ID，这会阻碍通用测试框架的开发，因为每台设备的 ION 实现可能会出现不同的行为。
Android 通用内核的 android12-5.10 分支已于 2021 年 3 月 1 日停用 CONFIG_ION。

参考[将 ION 堆转换为 DMA-BUF 堆](https://source.android.com/docs/core/architecture/kernel/dma-buf-heaps?hl=zh-cn)

```
Infinix-X6856:/dev/dma_heap # ls -al
total 0
drwxr-xr-x  2 root   root        260 2024-10-24 21:38 .
drwxr-xr-x 25 root   root      10020 2024-10-24 21:38 ..
cr--r--r--  1 system system 248,   2 2024-10-24 21:38 mtk_mm
cr--r--r--  1 system system 248,   3 2024-10-24 21:38 mtk_mm-uncached
cr--r--r--  1 system system 248,   4 2024-10-24 21:38 mtk_prot_page-uncached
cr--r--r--  1 system system 248,   9 2024-10-24 21:38 mtk_prot_region
cr--r--r--  1 system system 248,  10 2024-10-24 21:38 mtk_prot_region-aligned
cr--r--r--  1 system system 248,   7 2024-10-24 21:38 mtk_sapu_data_shm_region
cr--r--r--  1 system system 248,   8 2024-10-24 21:38 mtk_sapu_data_shm_region-aligned
cr--r--r--  1 system system 248,   5 2024-10-24 21:38 mtk_sapu_engine_shm_region
cr--r--r--  1 system system 248,   6 2024-10-24 21:38 mtk_sapu_engine_shm_region-aligned
cr--r--r--  1 system system 248,   0 2024-10-24 21:38 system
cr--r--r--  1 system system 248,   1 2024-10-24 21:38 system-uncached
Infinix-X6856:/dev/dma_heap #
```

## 实现

dma buffer 本身由 DMA-BUF exporter 创建，DMA-BUF exporter 是一个驱动程序，它可以分配特定类型的内存，而且还为 kernel、user space、device 提供了多种回调函数来处理 buffer 的 map 和 unmap 问题，所以exporter相当于一个buffer的生产者或者说是提供者。

而DMA-BUF importer则对应dma buffer的使用者，比如上层应用，而因为dma buffer是一种共享内存，所以同一个buffer的importer可以有多个，二者的特性说明：

exporter:
实现struct dma_buf_ops中的buffer管理回调函数；
允许其他消费者通过dma-buf的sharing APIS来共享buffer缓冲区；
通过struct dma_buf结构体管理buffer的分配、包装等细节工作；
决策buffer的实际后端内存的来源；
管理scatterlist迁徙；


importer:
是共享buffer的使用者之一；
无需担心缓冲区是如何/在哪里创建的；
通过struct dma_buf_attachment结构体访问用于构建buffer的scatterlist,并且提供将buffer映射到自己地址空间的机制，这样可以访问到内存的同块区域，实现共享内存



## 实现框架
dma-buf 由exporter 创建,然后 importer使用
有几个点需要关注
1. exporter 如何分配内存, 可以kzmalloc,也可以alloc_page
2. importer 如何获得 buf地址?
    + 通过userspace 中转,中转 fd
    + 直接 export import 

参考 [dma-buf 由浅入深（五） —— File](https://blog.csdn.net/hexiaolong2009/article/details/102596802)
