---
title: dumpsys常用命令
date: 2025-08-01 10:00:00
tags:
    - android
    - dumpsys
    - 调试
categories:
    - android
    - debug-trace工具链
slug: "android/debug-trace工具链/dumpsys常用命令"
---


## 简介

dumpsys 是 Android 系统中用于查看系统服务状态的重要工具。

## 基本用法

### 查看所有服务
```bash
adb shell dumpsys
```

### 查看特定服务
```bash
adb shell dumpsys <service_name>
```

## 常用服务

### 1. Activity Manager (AMS)
```bash
# 查看 Activity 信息
adb shell dumpsys activity activities

# 查看进程信息
adb shell dumpsys activity processes

# 查看服务信息
adb shell dumpsys activity services

# 查看广播信息
adb shell dumpsys activity broadcasts
```

### 2. Window Manager (WMS)
```bash
# 查看窗口信息
adb shell dumpsys window windows

# 查看焦点窗口
adb shell dumpsys window | grep -i focus

# 查看显示信息
adb shell dumpsys window displays
```

### 3. Input Manager
```bash
# 查看输入信息
adb shell dumpsys input

# 查看输入设备
adb shell dumpsys input devices
```

### 4. SurfaceFlinger
```bash
# 查看图层信息
adb shell dumpsys SurfaceFlinger

# 查看显示信息
adb shell dumpsys SurfaceFlinger --display-id
```

### 5. 包管理器
```bash
# 查看包信息
adb shell dumpsys package <package_name>

# 查看权限
adb shell dumpsys package permissions
```

### 6. 电池信息
```bash
adb shell dumpsys battery
```

### 7. 内存信息
```bash
adb shell dumpsys meminfo <package_name>
```

## 输出格式

### 窗口信息示例
```
Window #0 Window{xxx u0 com.example.app/xxx}:
  mDisplayId=0 mSession=xxx mClient=xxx
  mOwnerUid=10001 mShowToOwner=true
  mAttrs={(0,0)(fillxfill) sim={adjust=undefined} ty=APPLICATION ...
  Requested w=1080 h=1920
  mBaseLayer=21000 mSubLayer=0
```

## 输出重定向

### 保存到文件
```bash
adb shell dumpsys window windows > window_dump.txt
```

### 使用 grep 过滤
```bash
adb shell dumpsys window windows | grep -E "Window|mAttrs"
```

## 调试技巧

### 1. 查找特定窗口
```bash
adb shell dumpsys window windows | grep <package_name>
```

### 2. 查看窗口层级
```bash
adb shell dumpsys window | grep -E "mBaseLayer|mSubLayer"
```

### 3. 监控变化
```bash
while true; do adb shell dumpsys window | grep -i focus; sleep 1; done
```

## 注意事项

1. 某些服务需要 root 权限
2. 输出可能很长，建议重定向到文件
3. 不同 Android 版本输出格式可能不同

## 总结

dumpsys 是 Android 调试的重要工具，掌握常用命令可以快速查看系统状态和定位问题。
