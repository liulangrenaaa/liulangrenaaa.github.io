---
title: 常见ftrace用法
date: 2022-04-29 19:00:00
tags:
    - ftrace 用法
    - ftrace
categories:
    - linux内核
---



## 用法

1. systrace


2. 查看一个函数到底调用了哪些函数
加一些脚本，可以直接 解析成为 流程图
```
## 查看一个函数到底调用了哪些函数
#!/bin/bash

# tracing dir
DIR="/sys/kernel/debug/tracing"

# set_graph_function
echo "migrate_task_rq_fair"  > $DIR/set_graph_function

# tracer
echo "function_graph" > $DIR/current_tracer

# reset tracing
echo 0 >  $DIR/tracing_on
echo '' >  $DIR/trace
echo 1 >  $DIR/tracing_on

# delay
sleep 1

# get result
cat $DIR/trace
```


3. 查看一个函数到底调用了哪些函数，但是屏蔽一些spin_lock等操作
使用 `set_graph_notrace` 来屏蔽 `spin_lock` 等操作
```
## 查看一个函数到底调用了哪些函数
#!/bin/bash

# tracing dir
DIR="/sys/kernel/debug/tracing"

# set_graph_function
echo "migrate_task_rq_fair"  > $DIR/set_graph_function

# set_graph_notrace
echo "*raw_spin*"  > $DIR/set_graph_notrace


# tracer
echo "function_graph" > $DIR/current_tracer

# reset tracing
echo 0 >  $DIR/tracing_on
echo '' >  $DIR/trace
echo 1 >  $DIR/tracing_on

# delay
sleep 1

# get result
cat $DIR/trace
```


4. 查看一个函数到底调用了哪些函数，但是屏蔽一些spin_lock等操作
使用 `set_graph_notrace` 来屏蔽 `spin_lock` 等操作

