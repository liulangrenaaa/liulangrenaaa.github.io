---
title: rcu简介
date: 2021-02-26 19:00:40
tags:
    - rcu
categories:
    - linux内核
slug: "rcu/rcu简介"
---


RCU顾名思义--Read Copy Update，我的理解是：
读者直接读，没有任何开销，写者需要先Copy，然后等待合适的时机(宽限期)，去更新 Update。

记得之前有一道笔试题叫 无锁编程？
现在想想应该是有以下几类吧
```
1. 原子操作
2. CAS操作
3. 使用rcu编程
......
```

## WHY RCU?

在RCU的实现过程中，我们主要解决以下问题：
1. 在读取过程中，另外一个线程删除了一个节点。删除线程可以把这个节点从链表中移除，但它不能直接销毁这个节点，必须等到所有的读取线程读取完成以后，才进行销毁操作。RCU中把这个过程称为宽限期（Grace period）。
2. 在读取过程中，另外一个线程插入了一个新节点，而读线程读到了这个节点，那么需要保证读到的这个节点是完整的。这里涉及到了发布-订阅机制（Publish-Subscribe Mechanism）。
3. 保证读取链表的完整性。新增或者删除一个节点，不至于导致遍历一个链表从中间断开。但是RCU并不保证一定能读到新增的节点或者不读到要被删除的节点。

关于 RCU 和 其他锁的性能对比:
1. RCU 的性能优势（scalblity）往往体现在多核上
2. 相对于 rwlock等锁来说，RCU的效率可以高到10 - 100倍


## rcu 的编程API
For reader:
```
rcu_read_lock(void);
rcu_read_unlock(void);
rcu_read_lock_bh(void);
rcu_read_unlock_bh(void);
```

For writer:
```
void call_rcu(struct rcu_head *head, rcu_callback_t func);
void synchronize_rcu(void);

#define rcu_assign_pointer(p, v)
#define rcu_replace_pointer(rcu_ptr, ptr, c)
rcu_dereferencercu_read_unlock(void);
```

和调度器相关的 API
```
static void __sched notrace __schedule(bool preempt)
{
        ......
	rcu_note_context_switch(preempt);
        ......
}
```

## RCU类型
`TINY RCU` 一般只有arm32 UP系统使用了，使用场景很少。
`TREE RCU` 从4核 到 1024 核心都可以很好的支持。

arm64平台 和 x86平台 defconfig 都是使用的是 `TREE RCU`。
所以重点还是放在 `TREE RCU`，同时需要关注 `SRCU`。


## CONFIG_PREEMPT_RCU
抢占式 RCU含义是？








