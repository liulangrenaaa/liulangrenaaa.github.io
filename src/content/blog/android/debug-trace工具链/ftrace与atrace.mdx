---
title: ftrace与atrace
date: 2025-08-10 10:00:00
tags:
    - android
    - ftrace
    - atrace
    - 性能分析
categories:
    - android
    - debug-trace工具链
slug: "android/debug-trace工具链/ftrace与atrace"
---


## 简介

ftrace 和 atrace 是 Linux 和 Android 系统中用于内核级跟踪的重要工具。

## ftrace

### 概念
- Linux 内核的跟踪框架
- 用于跟踪内核函数、调度、中断等
- 通过 /sys/kernel/debug/tracing 访问

### 常用跟踪器
| 跟踪器 | 说明 |
|--------|------|
| function | 函数调用跟踪 |
| function_graph | 函数调用图 |
| sched_switch | 调度切换 |
| irq | 中断跟踪 |

### 使用方法
```bash
# 启用跟踪
echo 1 > /sys/kernel/debug/tracing/tracing_on

# 设置跟踪器
echo function > /sys/kernel/debug/tracing/current_tracer

# 查看跟踪结果
cat /sys/kernel/debug/tracing/trace
```

## atrace

### 概念
- Android 的跟踪框架
- 基于 ftrace 构建
- 提供 Android 特定的跟踪类别

### 常用类别
| 类别 | 说明 |
|------|------|
| gfx | 图形 |
| input | 输入 |
| view | View 系统 |
| wm | 窗口管理 |
| am | Activity 管理 |
| sched | 调度 |
| freq | CPU 频率 |

### 使用方法
```bash
# 抓取 trace
adb shell atrace -z -b 10000 gfx input view wm am sched freq > trace.txt

# 使用 systrace
python systrace.py gfx input view wm am sched freq
```

## 高级用法

### 自定义 trace 点
```cpp
// C++ 代码中添加 trace
ATRACE_BEGIN("my_function");
// 你的代码
ATRACE_END();
```

```java
// Java 代码中添加 trace
Trace.beginSection("my_method");
// 你的代码
Trace.endSection();
```

### 内核事件跟踪
```bash
# 跟踪调度事件
echo 1 > /sys/kernel/debug/tracing/events/sched/sched_switch/enable

# 跟踪中断事件
echo 1 > /sys/kernel/debug/tracing/events/irq/irq_handler_entry/enable
```

## 分析工具

### 1. Perfetto
- Web UI 可视化
- 支持多种数据源
- 强大的分析功能

### 2. systrace
- 命令行工具
- 生成 HTML 报告
- 简单易用

### 3. trace-cmd
- 内核 trace 工具
- 支持远程抓取
- 灵活的过滤功能

## 最佳实践

1. 明确分析目标
2. 选择合适的跟踪类别
3. 控制 trace 大小
4. 使用合适的分析工具
5. 结合多个 trace 分析

## 总结

ftrace 和 atrace 是系统级性能分析的重要工具，掌握其使用方法有助于深入分析系统性能问题。
