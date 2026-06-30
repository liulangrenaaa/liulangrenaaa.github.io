---
title: asid
date: 2022-07-01 19:00:40
tags:
    - mm
    - asid
    - schedule
categories:
    - linux内核
slug: "memory/asid"
---


`asid` 是 aarch64 架构特有的机制。
为什么引入 `asid`?
```
To reduce the software overhead of TLB maintenance, the VMSA distinguishes between Global pages and Process specific pages. The Address Space Identifier (ASID) identifies pages associated with a specific process and provides a mechanism for changing process specific tables without having to perform maintenance on the TLB structures
```

ASID 需要和 mmu pagetable 中的　nG bit 配合使用。

nG == 0 内存转换页表是全局属性，　该内存区域可供所有进程访问
nG == 1 内存转换页表是非全局属性，亦即是进程相关的，该内存区域仅供
当前 ASID 的进程所使用。

## 进程相关 asid
aarch64 中
上下文切换的时候才真正开始给ASID赋值, 并设置CONTEXTIDR寄存器.

有分配, 就该有回收, 这也是使用bitmap来管理ASID, 而不是asid++的方式的原因. ASID的分配是通过bitmap变量asid_map来记录的. set bit的操作在new_context()中可以找到. 查找对该变量的clear bit操作, 进程退出时, 本应有该动作(清asid_map中该进程所对应的bit), 但很遗憾, 没有找到, 开发人员偷懒了?

由于ASID只有8bit, 范围为0~0xff, 当这些值分配完后, 就需要flush TLB, 同时对generation加1, 然后重新开始分配ASID. generation为mm->context.id的高24+32位(D63:D8), 这样, 后续再调度到这个进程时, 就可以通过判断generation是否变化了, 来知道 mm->context.id中的ASID是否还有效


new_context



























参考[ASID](https://zhuanlan.zhihu.com/p/55265099)
