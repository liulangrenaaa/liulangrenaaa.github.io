---
title: per-cpu变量引起的思考
date: 2020-09-05 19:00:00
tags:
    - 内核同步
    - per-cpu
categories:
    - linux内核
---

## 疑问
1. 内核为什么要引入per-cpu变量？解决了什么问题？
2. per-cpu变量如何实现的？
3. 是否可以用数组实现per-cpu变量？
4. per-cpu变量访问有什么原则？
5. 如果一个per-cpu变量既可以在线程上下文中访问，又可以在中断上下文中访问，需要保护吗？


接下来我们就带着以上的疑问继续往下看

## 内核为什么要引入per-cpu变量？解决了什么问题？
per-cpu变量是Linux内核中的一种同步机制。 当系统中的所有CPU访问并共享变量V时，CPU0修改变量V的值。

CPU1也会同时修改变量V，这将导致变量V的值不正确。如果使用了原子锁，CPU0只能等待修改。

这种方式有两个缺点：

（1）原子操作很耗时

（2）现在，所有CPU都具有L1高速缓存，因此许多CPU同时访问变量将导致高速缓存一致性问题。 当CPU修改共享变量V时，其他CPU上的相应缓存行必须无效，这会导致性能损失。

per-cpu变量提供了解决上述问题的有趣功能。 它将变量的副本分配给系统中的每个处理器。 在多处理器系统中，当处理器只能访问其所属变量的副本时，无需考虑与其他处理器的竞争，因此可以充分利用处理器的本地硬件缓存来提高性能。 。

## per-cpu变量如何实现的？
这里分 静态per-cpu变量 和 动态per-cpu变量
首先看一下使用的 API
```
// 静态定义 include/linux/Percpu-def.h
#define DECLARE_PER_CPU(type, name)                    \
    DECLARE_PER_CPU_SECTION(type, name, "")

#define DEFINE_PER_CPU(type, name)                    \
    DEFINE_PER_CPU_SECTION(type, name, "")

// 动态定义 include/linux/percpu.h
#define alloc_percpu(type)	\
	(typeof(type) __percpu *)__alloc_percpu(sizeof(type), __alignof__(type))

void free_percpu(void __percpu *__pdata);
```