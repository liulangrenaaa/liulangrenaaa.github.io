---
title: wm-logging与ProtoLog
date: 2025-07-15 10:00:00
tags:
    - android
    - WMS
    - logging
    - ProtoLog
categories:
    - android
    - debug-trace工具链
---

## 简介

wm-logging 和 ProtoLog 是 Android 系统中用于调试窗口管理器（WMS）的重要工具。

## wm-logging

### 启用方式
```bash
# 启用所有 WMS 日志
adb shell wm logging enable-text WM_DEBUG_ALL

# 启用特定日志
adb shell wm logging enable-text WM_DEBUG_FOCUS
adb shell wm logging enable-text WM_DEBUG_APP_TRANSITIONS
```

### 常用日志类别
| 类别 | 说明 |
|------|------|
| WM_DEBUG_FOCUS | 焦点变化 |
| WM_DEBUG_APP_TRANSITIONS | 应用转场 |
| WM_DEBUG_WINDOW_MOVEMENT | 窗口移动 |
| WM_DEBUG_RESIZE | 窗口大小调整 |

### 查看日志
```bash
adb logcat -s WindowManager:V
```

## ProtoLog

### 概念
- Protocol Buffer 格式的日志
- 更高效的日志系统
- 支持动态启用/禁用

### 启用方式
```bash
# 启用 ProtoLog
adb shell wm logging enable-proto WM_DEBUG_FOCUS

# 禁用 ProtoLog
adb shell wm logging disable-proto WM_DEBUG_FOCUS
```

### 优势
1. **性能**：编译时优化，运行时开销小
2. **格式化**：结构化数据，便于分析
3. **动态控制**：运行时启用/禁用

## 使用场景

### 1. 焦点问题调试
```bash
adb shell wm logging enable-text WM_DEBUG_FOCUS
adb logcat -s WindowManager:V | grep -i focus
```

### 2. 窗口动画调试
```bash
adb shell wm logging enable-text WM_DEBUG_APP_TRANSITIONS
adb logcat -s WindowManager:V | grep -i transition
```

### 3. 输入事件调试
```bash
adb shell wm logging enable-text WM_DEBUG_INPUT
adb logcat -s WindowManager:V | grep -i input
```

## 日志分析

### 1. 焦点变化
```
Focus changing: Window{xxx} -> Window{xxx}
```

### 2. 窗口添加
```
Adding window: Window{xxx}
```

### 3. 动画开始
```
Starting transition: xxx
```

## 最佳实践

1. 只启用需要的日志类别
2. 使用 grep 过滤关键信息
3. 结合 trace 分析问题
4. 及时关闭不需要的日志

## 总结

wm-logging 和 ProtoLog 是调试 WMS 问题的重要工具，合理使用可以快速定位窗口相关问题。
