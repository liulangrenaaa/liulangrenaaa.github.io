---
title: sched latency + memory direct reclaim
date: 2021-02-22 19:00:40
tags:
    - sched latency
    - memory direct reclaim
categories:
    - linux内核
slug: "mycase/sched-latency-+-memory-direct-reclaim"
---


## 现象
UAV在空中悬停，同时下载拍摄的视频到手机中，会导致飞机漂移较多。
飞控反馈说是感知的深度图数据频率不对，导致姿态问题。
感知深度图传输流程是linux侧的一个 hrtimer 中释放一个信号量给一个线程，驱动内核线程中会处理相关的数据然后给Cortex M核发送一个中断，飞控从中断中获得数据。
异构SOC上，Cortex-M核心反馈说 linux上送出去的数据延迟不确定，有时候会很大。

## case

1. 首先看了 hrtimer的配置，基本没有问题，排除hrtimer频率不稳定导致的问题
2. 怀疑是 hrtimer中，release sema之后，由于系统调度延迟很大，导致的线程没有及时投入运行，最后导致时间很不稳定
3. 使用 `perf sched`抓取实际的调度相关数据，发现在未在空中飞行的时候`sched latency`是一个比较正常的值，由于 `perf` 运行时的overhead 较大，也不能直接将 perf部署之后飞上天。
4. 寻找了 `bytedance`的开源工具`trace_noschedule`，其实就是一个内核模块；原理主要是一个hrtimer一直在采样，可以设置一个阈值a，可以将调度延迟大于多少的进程stack直接记录下来。
5. 部署之后看了调度延迟之后，同场景测试之后，还是会出现飞机漂移，但是没有调度延迟特别高的线程。
6. 只能关注系统其他类型的资源了，比如 memory io等，使用 `sar -B 1`在实际场景中测试发现他的
直接内存回收指标非常高
7. 怀疑是 处理的驱动线程，在处理图像数据的时候，会申请较多内存导致的内存分配延迟较高，最后处理深度图时间从原来2ms，直接延长到10ms以上，导致linux -> rtos中断不及时。
8. bpftrace vmscan_direct_reclaim_[begin,end] 相关接口，果然是 触发了内存直接回收，且看时间戳，延迟时间有10ms以上，找到问题根源
9. 可以调整 vm_free_kbytes，使得 min 与 low水位之间间距变大，更早触发 kswapd 内存回收，更难触发 `direct reclaim`。










