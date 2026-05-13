---
title: FocusedWindow与FocusedApp
date: 2024-07-15 10:00:00
tags:
    - android
    - input
    - FocusedWindow
    - WMS
categories:
    - android
    - input输入系统
---

## 简介

FocusedWindow（焦点窗口）和 FocusedApp（焦点应用）是输入系统中的重要概念，决定了输入事件的分发目标。

## FocusedWindow

### 定义
- 当前接收输入事件的窗口
- 同一时间只有一个焦点窗口

### 更新时机
```
WMS.updateFocusedWindowLocked()
    → InputMonitor.setInputFocusLw()
    → InputDispatcher.setFocusedWindow()
```

### 影响因素
1. 窗口可见性
2. 窗口层级
3. 窗口类型
4. 窗口标志

## FocusedApp

### 定义
- 当前焦点应用的 ActivityRecord
- 用于判断应用是否响应

### 与 FocusedWindow 的关系
- FocusedApp 是应用层面的概念
- FocusedWindow 是窗口层面的概念
- 一个 FocusedApp 可能有多个窗口

## 焦点切换流程

```
Activity.onResume()
    → WMS.updateFocusedWindowLocked()
    → InputMonitor.updateInputWindowsLw()
    → InputDispatcher.setFocusedWindow()
```

## 常见问题

### 1. 焦点丢失
- 窗口不可见
- 窗口被遮挡
- 窗口标志问题

### 2. 焦点切换异常
- 窗口层级配置错误
- 焦点更新时序问题

## 调试方法

### 查看焦点窗口
```bash
adb shell dumpsys window | grep -i focus
```

### 查看输入焦点
```bash
adb shell dumpsys input | grep -i focus
```

## 总结

FocusedWindow 和 FocusedApp 是输入系统的核心概念，正确管理焦点是保证输入事件正确分发的关键。
