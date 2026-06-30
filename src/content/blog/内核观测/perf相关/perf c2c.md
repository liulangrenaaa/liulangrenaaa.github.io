---
title: perf c2c
date: 2021-11-03 19:00:00
tags:
    - perf
    - perf c2c
categories:
    - kernel debug
    - cache false sharing
slug: "内核观测/perf相关/perf-c2c"
---


## 介绍

`perf c2c` 是 perf 的一个子工具, `c2c` 代表着 `cache to cache`。
```
The perf c2c tool provides means for Shared Data C2C/HITM analysis. It allows you to track down the cacheline contentions.
```
可以用来分析 cache 伪共享的问题



## 使用

### 查看系统 cache line size
```
ubuntu@zeku_server:~/workspace/share/test_modules $ cat /proc/cpuinfo | grep size
cache size      : 12288 KB
clflush size    : 64
address sizes   : 39 bits physical, 48 bits virtual
cache size      : 12288 KB
clflush size    : 64
address sizes   : 39 bits physical, 48 bits virtual
......
cache size      : 12288 KB
clflush size    : 64
address sizes   : 39 bits physical, 48 bits virtual
cache size      : 12288 KB
clflush size    : 64
address sizes   : 39 bits physical, 48 bits virtual
cache size      : 12288 KB
clflush size    : 64
address sizes   : 39 bits physical, 48 bits virtual
ubuntu@zeku_server:~/workspace/share/test_modules $
```

`clflush size` 就是系统中 cache line flush size的大小，其实就是 cache line size大小，单位是 byte。


更直接的方式是 `/sys/devices/system/cpu/cpu1/cache` 目录下
```
ubuntu@zeku_server:/sys/devices/system/cpu/cpu1/cache $ cat index0/coherency_line_size
64
ubuntu@zeku_server:/sys/devices/system/cpu/cpu1/cache $ cat index0/type
Data
ubuntu@zeku_server:/sys/devices/system/cpu/cpu1/cache $ cat index0/size
32K
ubuntu@zeku_server:/sys/devices/system/cpu/cpu1/cache $
```

###



















参考[C2C - False Sharing Detection in Linux Perf](https://joemario.github.io/blog/2016/09/01/c2c-blog/)
参考[man perf c2c](https://man7.org/linux/man-pages/man1/perf-c2c.1.html)
参考[检测错误共享](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/8/html/monitoring_and_managing_system_status_and_performance/detecting-false-sharing_monitoring-and-managing-system-status-and-performance#the-purpose-of-perf-c2c_detecting-false-sharing)


