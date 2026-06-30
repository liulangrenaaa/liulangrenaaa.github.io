---
title: vip_thread
date: 2021-04-30 19:00:00
tags:
    - HW
    - schedule
categories:
    - schedule
slug: "schedule/HW/vip_thread"
---


## 介绍
在手机场景中，总有些进程对用户体验是相对其他进程来说高很多的，比如UI线程等，一旦调度不及时，就会给用户造成手机很卡的感觉，所以我们必须识别处这样的vip进程，然后给予更高的待遇，这是几种可行方案：
+ 识别出 vip thread，然后来设置为 rt调度策略
+ 识别出 vip thread, 动态给予很小的nice值，使得运行更多
+ 识别出 vip thread, 修改 vruntime 的值，使得运行更多
+ 识别出 vip thread, 给 cfs 中也添加 类似 rt的硬优先级


### 方案一
识别出 vip thread，然后来设置为 rt调度策略
优点：可以快速得到运行
缺点：可能会抢占系统中本身的rt进程；但是rt的 thread可以抢占，会导致后面加入的进程反而会强占之前的进程


### 方案二和三
识别出 vip thread, 动态给予很小的nice值 or 修改 vruntime的值，使得运行更多
优点：可以使得vip thread 运行的更久一点
缺点：但是可能延迟较大，不能立刻投入运行


### 方案四
识别出 vip thread, 给 cfs 中也添加 类似 rt的硬优先级
优点：相对于方案一来说，不会抢占系统中原油的 rt 进程；相对于方案二来说，实时性会大大提高
缺点：需要自己扩展 cfs调度类







## 方案实现
vip_thread 方案主要分为 `识别vip_thread` `vip_thread 数据结构怎么组织` `vip_thread怎么调度` `vip_thread 对资源的依赖`





### 识别 vip_thread
如何识别 `vip_thread` 是一切的开始，vip_thread 定义是和用户体验及其相关的进程，主要是UI线程，`kernel` 自身很难感知到，但是 `framework`层是可以感知到的，直接提供`proc` 节点出去给framework 来帮助识别 vip_thread









### vip_thread 数据结构怎么组织
被识别成为`vip_thread` 的进程主要是 ui进程，在安卓中的调度策略都是cfs，所以将 `vip_thread` 的相关数据结构添加到 `cfs_rq` 中：
```
#ifdef CONFIG_HW_VIP_THREAD
	/*task list for vip thread*/
	struct list_head vip_thread_list;
	int active_vip_balance;
	struct cpu_stop_work vip_balance_work;
#endif
```
当前为了实现简单，将 vip_thread 以 链表数据结构链接到 `vip_thread_list` 中，
`active_vip_balance` 表明此 rq 是否正在做 vip_thread 的 `load_balance`，
`vip_balance_work` 是 load_balance 的 work结构。

还需要在 `struct task_struct` 中添加如下结构：
```
#ifdef CONFIG_HW_VIP_THREAD
	int static_vip;
	int vip_depth;
	atomic64_t dynamic_vip;
	struct list_head vip_entry;
	u64 enqueue_time;
	u64 dynamic_vip_start;
#endif
```




### vip_thread 怎么调度












































































参考[HW_P50_888_Code](https://consumer.huawei.com/en/opensource/detail/?siteCode=worldwidw?productCode=Smartphones&fileType=openSourceSoftware&pageSize=10)



