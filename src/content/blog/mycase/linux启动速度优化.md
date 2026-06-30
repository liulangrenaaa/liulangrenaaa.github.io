---
title: linux启动速度优化
date: 2022-11-30 19:00:40
tags:
    - 锁优化
categories:
    - linux内核
slug: "mycase/linux启动速度优化"
---


## 启动时间定义
一般都是指上电到init 进程执行的时间,作为 kernel启动时间


## 测量启动时间
优化启动时间前总需要 知道哪部分最耗时

### bootgraph
打开 `initcall_debug` ,众所周知，kernel启动时会执行不同等级的initcall，而每个initcall的耗时也是可以统计的。

在kernel的cmdline中加入参数initcall_debug=1：
```
initcall_debug=1
setargs_nand=setenv bootargs console=${console} earlyprintk=${earlyprintk} root=${nand_root} initcall_debug=${initcall_debug} init=${init}
```
然后使用 scripts/bootgraph.pl 进行转为图形测量


### bootchart
bootchart是一个用于linux启动过程性能分析的开源软件工具，在系统启动过程自动收集CPU占用率、进程等信息，
并以图形方式显示分析结果，可用作指导优化系统启动过程。

需要:
+ 修改kernel cmdline。将其中的init修改为“init=/sbin/bootchartd”。
+ 收集信息。bootchartd会从/proc/stat，/proc/diskstat，/proc/[pid]/stat中采集信息，经过处理后保存为bootchart.tgz文件
+ 转换图片。在pc上通过pybootchartgui.py工具将bootchart.tgz转换为bootchart.png，方便分析


## 优化启动

### 裁剪内核模块
通过bootgraph 工具可以知道哪些模块耗时久, 确定项目中是否真的需要,不需要久干掉,如果需要可以优化

### initcall module 并行
initcall有很多等级，但比较耗时的是module。

如果是多核，可以考虑将module_initcall并行执行来节省时间。

目前内核do_initcalls是一个一个按照顺序来执行，可以修改成新建内核线程来执行

### 减少串口打印,非常耗时

### 预设置lpj数值
LPJ也就是loops_per_jiffy，每次启动都会计算一次，但如果没有做修改的话，这个值每次启动算出来都是一样的，可以直接提供数值跳过计算。

如下log所示，有skipped，lpj由timer计算得来，不需要再校准calibrate了。
```
[    0.702258] Calibrating delay loop (skipped) preset value.. 6192.01 BogoMIPS (lpj=3096009)
```