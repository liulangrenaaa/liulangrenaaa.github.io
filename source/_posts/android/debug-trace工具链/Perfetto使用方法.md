---
title: Perfetto使用方法
date: 2025-07-01 10:00:00
tags:
    - android
    - perfetto
    - trace
    - 性能分析
categories:
    - android
    - debug-trace工具链
---

## 简介

Perfetto 是 Android 系统中强大的性能分析工具，用于收集和分析系统级 trace 数据。

## 核心功能

### 1. 系统级 Trace
- CPU 调度
- 内存使用
- I/O 操作
- 图形渲染

### 2. 应用级 Trace
- 函数调用
- 方法耗时
- 线程状态

## 使用方式

### 1. 命令行抓取
```bash
# 抓取 10 秒 trace
adb shell perfetto -o /data/misc/perfetto-traces/trace -t 10s sched freq idle am wm gfx view binder_driver hal dalvik camera input res

# 拉取 trace 文件
adb pull /data/misc/perfetto-traces/trace
```

### 2. 配置文件抓取
```bash
# 创建配置文件
cat > config.pbtx <<EOF
buffers {
  size_kb: 63488
  fill_policy: DISCARD
}
data_sources {
  config {
    name: "linux.ftrace"
    ftrace_config {
      ftrace_events: "sched/sched_switch"
      ftrace_events: "power/suspend_resume"
    }
  }
}
duration_ms: 10000
EOF

# 使用配置文件抓取
adb shell perfetto -c - -o /data/misc/perfetto-traces/trace < config.pbtx
```

### 3. Web UI 抓取
访问 https://ui.perfetto.dev/ 进行可视化抓取

## 分析 Trace

### 1. 打开 Trace
访问 https://ui.perfetto.dev/ 并打开 trace 文件

### 2. 查看内容
- **Timeline**：时间线视图
- **CPU**：CPU 调度信息
- **Processes**：进程信息
- **Threads**：线程信息

### 3. 常用操作
- 缩放：滚轮或快捷键
- 选择：点击或拖拽
- 搜索：Ctrl+F

## 关键指标

### 1. CPU 使用率
- 用户态
- 内核态
- 空闲

### 2. 调度延迟
- 线程等待时间
- 运行时间

### 3. 帧率
- FPS
- 掉帧情况

## 与其他工具对比

| 工具 | 优势 | 劣势 |
|------|------|------|
| Perfetto | 功能强大、可视化好 | 学习成本高 |
| systrace | 简单易用 | 功能有限 |
| ftrace | 底层详细 | 分析复杂 |

## 最佳实践

1. 明确分析目标
2. 选择合适的配置
3. 抓取足够长的时间
4. 结合多个指标分析

## 总结

Perfetto 是 Android 性能分析的利器，掌握其使用方法有助于快速定位性能问题。
