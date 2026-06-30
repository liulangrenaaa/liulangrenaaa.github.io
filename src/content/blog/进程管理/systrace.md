---
title: linux lockup问题
date: 2020-09-12 19:00:00
tags:
    - 进程调度
    - systrace
categories:
    - linux内核
slug: "进程管理/systrace"
---



## 介绍
systrace是Android4.1版本之后推出的，对系统Performance分析的工具。
systrace的功能包括跟踪系统的I/O操作、内核工作队列、CPU负载以及Android各个子系统的运行状况等。
主要分为三个部分：
+ 内核部分: 利用了Linux Kernel中的ftrace功能。如果要使用systrace的话，必须开启kernel中和ftrace相关的config
+ 数据采集部分:Android定义了一个Trace类。应用程序可利用该类把统计信息输出给ftrace。同时，Android还有一个atrace程序，它可以从ftrace中读取统计信息然后交给数据分析工具来处理。
+ 数据分析工具:Android提供一个`systrace.py`（python脚本文件，位于`Android SDK目录/sdk/platform-tools/systrace`中。

systrace 参数
|options	                      |  描述             |
|               ---                   |       ---        |
|-o < FILE >	                      |  输出的目标文件   |
|-t N, –time=N	                      |  执行时间，默认5s |
|-b N, –buf-size=N	              |  buffer大小（单位kB),用于限制trace总大小，默认无上限 |
|-k < KFUNCS >，–ktrace=< KFUNCS >    |  追踪kernel函数，用逗号分隔  |
|-a < APP_NAME >,–app=< APP_NAME >    |  追踪应用包名，用逗号分隔    |
|–from-file=< FROM_FILE >	      |  从文件中创建互动的systrace  |
|-l, –list-categories	              |  列举可用的tags             |

-l 的tags,可以标识想抓哪些 systrace
```
λ python systrace.py -l
         gfx - Graphics
       input - Input
        view - View System
     webview - WebView
          wm - Window Manager
          am - Activity Manager
          sm - Sync Manager
       audio - Audio
       video - Video
      camera - Camera
         hal - Hardware Modules
         res - Resource Loading
      dalvik - Dalvik VM
          rs - RenderScript
      bionic - Bionic C Library
       power - Power Management
          pm - Package Manager
          ss - System Server
    database - Database
     network - Network
         adb - ADB
    vibrator - Vibrator
        aidl - AIDL calls
       nnapi - NNAPI
         rro - Runtime Resource Overlay
         pdx - PDX services
       sched - CPU Scheduling
        freq - CPU Frequency
        idle - CPU Idle
        disk - Disk I/O
        sync - Synchronization
  memreclaim - Kernel Memory Reclaim
  binder_driver - Binder Kernel driver
  binder_lock - Binder global lock trace
      memory - Memory
         gfx - Graphics (HAL)
         ion - ION allocation (HAL)

NOTE: more categories may be available with adb root
```

`sched`: CPU调度的信息，非常重要；你能看到CPU在每个时间段在运行什么线程；线程调度情况，比如锁信息。
`gfx`：Graphic系统的相关信息，包括SerfaceFlinger，VSYNC消息，Texture，RenderThread等；分析卡顿非常依赖这个。
`view`: View绘制系统的相关信息，比如onMeasure，onLayout等；对分析卡顿比较有帮助。
`am`：ActivityManager调用的相关信息；用来分析Activity的启动过程比较有效。
`dalvik`: 虚拟机相关信息，比如GC停顿等。
`binder_driver`: Binder驱动的相关信息，如果你怀疑是Binder IPC的问题，不妨打开这个。
`core_services`: SystemServer中系统核心Service的相关信息，分析特定问题用。


## 步骤
常用的命令行抓取systrace
`python D:\Users\50001309\AppData\Local\Android\Sdk\platform-tools\systrace\systrace.py  -o D:\systrace\outfile\trace.html   sched gfx view am core_services  freq -t 10 -b 40960`

抓取 systrace 之后，在 `chrome://tracing/` 或者 `https://ui.perfetto.dev/#!/` 地址上解析


## 快捷键

+ W: 放大 Systrace , 放大可以更好地看清局部细节
+ S: 缩小 Systrace, 缩小以查看整体
+ A: 左移
+ D: 右移
+ M: 高亮选中当前鼠标点击的段(这个比较常用,可以快速标识出这个方法的左右边界和执行时间,方便上下查看)

+ 数字键1: 切换到 Selection 模式 , 这个模式下鼠标可以点击某一个段查看其详细信息, 一般打开 Systrace 默认就是这个模式 , 也是最常用的一个模式 , 配合M 和ASDW 可以做基本的操作
+ 数字键2: 切换到 Pan 模式 , 这个模式下长按鼠标可以左右拖动, 有时候会用到
+ 数字键3: 切换到 Zoom 模式 , 这个模式下长按鼠标可以放大和缩小, 有时候会用到
+ 数字键4: 切换到 Timing 模式 , 这个模式下主要是用来衡量时间的,比如选择一个起点, 选择一个终点, 查看起点和终点这中间的操作所花费的时间.


## 查看当前前台进程的pid
```
raven:/ $ logcat -b events |grep on_resume
01-21 17:10:45.959  2236  2236 I wm_on_resume_called: [105694312,com.android.settings.FallbackHome,RESUME_ACTIVITY]
01-21 17:10:47.972  2318  2318 I wm_on_resume_called: [50407132,com.android.launcher3.uioverrides.QuickstepLauncher,RESUME_ACTIVITY]
01-21 17:10:48.309  2318  2318 I wm_on_resume_called: [50407132,com.android.launcher3.uioverrides.QuickstepLauncher,RESUME_ACTIVITY]
01-21 17:10:52.867  3699  3699 I wm_on_resume_called: [43073904,com.ss.android.ugc.aweme.splash.SplashActivity,RESUME_ACTIVITY]
01-21 17:15:19.001  2318  2318 I wm_on_resume_called: [50407132,com.android.launcher3.uioverrides.QuickstepLauncher,RESUME_ACTIVITY]
01-21 17:16:10.807  3699  3699 I wm_on_resume_called: [43073904,com.ss.android.ugc.aweme.splash.SplashActivity,RESUME_ACTIVITY]
```



## 平台迁移
systrace 只是Google给安卓设备的开发的，那么是否可以使用到server上或者确认书linux设备上呢？实际上是可以的，只不过没有安卓的相关事件，只有kernel原生的一些事件

当然需要做一些工作，
```
https://github.com/liulangrenaaa/systrace
```

可以直接使用 `python systrace.py -t 10 -v -e "sched,irq"`
输出 trace.html














参考[google官方systrace介绍](https://source.android.com/devices/tech/debug/systrace?hl=zh-cn)
参考[Gracker的android performance](https://androidperformance.com/2019/12/01/BlogMap/)
参考[苍耳叔叔的博客](https://ljd1996.github.io/)
参考[sunwengang blog](https://wizzie.top/Blog/)
参考[Android Systrace如何抓取分析问题](https://wizzie.top/Blog/2020/02/22/2020/200222_android_systrace_study/)
参考[confluence](https://doc.myoas.com/pages/viewpage.action?pageId=257699103)