---
title: adb调试命令速查
date: 2025-08-15 10:00:00
tags:
    - android
    - adb
    - 调试
categories:
    - android
    - debug-trace工具链
slug: "android/debug-trace工具链/adb调试命令速查"
---


## 简介

本文整理了常用的 adb 调试命令，方便快速查找和使用。

## 设备管理

### 查看设备
```bash
adb devices
```

### 连接设备
```bash
adb connect <ip>:<port>
```

### 断开设备
```bash
adb disconnect
```

## 应用管理

### 安装应用
```bash
adb install <apk_path>
adb install -r <apk_path>  # 覆盖安装
```

### 卸载应用
```bash
adb uninstall <package_name>
```

### 启动应用
```bash
adb shell am start -n <package_name>/<activity_name>
```

### 停止应用
```bash
adb shell am force-stop <package_name>
```

## 日志查看

### 实时日志
```bash
adb logcat
```

### 过滤日志
```bash
adb logcat -s <tag>
adb logcat | grep <keyword>
```

### 清除日志
```bash
adb logcat -c
```

### 崩溃日志
```bash
adb logcat -b crash
```

## 文件操作

### 推送文件
```bash
adb push <local_path> <remote_path>
```

### 拉取文件
```bash
adb pull <remote_path> <local_path>
```

### 列出文件
```bash
adb shell ls <path>
```

## 系统信息

### 设备信息
```bash
adb shell getprop
adb shell getprop ro.build.version.release
```

### CPU 信息
```bash
adb shell cat /proc/cpuinfo
adb shell top -m 10
```

### 内存信息
```bash
adb shell cat /proc/meminfo
adb shell dumpsys meminfo <package_name>
```

### 电池信息
```bash
adb shell dumpsys battery
```

## 调试命令

### 截图
```bash
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### 录屏
```bash
adb shell screenrecord /sdcard/record.mp4
```

### 输入事件
```bash
adb shell input tap <x> <y>
adb shell input swipe <x1> <y1> <x2> <y2>
adb shell input text "text"
adb shell input keyevent <keycode>
```

### 窗口信息
```bash
adb shell dumpsys window windows
adb shell dumpsys window | grep -i focus
```

### Activity 信息
```bash
adb shell dumpsys activity activities
adb shell dumpsys activity top
```

## 性能分析

### CPU 使用
```bash
adb shell top -m 10
adb shell dumpsys cpuinfo
```

### 内存使用
```bash
adb shell dumpsys meminfo <package_name>
```

### 帧率
```bash
adb shell dumpsys gfxinfo <package_name>
```

### 电池使用
```bash
adb shell dumpsys batterystats
```

## 网络调试

### 查看网络状态
```bash
adb shell netstat
adb shell ifconfig
```

### 端口转发
```bash
adb forward tcp:<local_port> tcp:<remote_port>
```

### 无线调试
```bash
adb tcpip 5555
adb connect <ip>:5555
```

## Shell 命令

### 执行命令
```bash
adb shell <command>
```

### 交互式 Shell
```bash
adb shell
```

### Root 权限
```bash
adb root
adb shell su
```

## 常用快捷键

| 快捷键 | 说明 |
|--------|------|
| Ctrl+C | 中断命令 |
| Ctrl+Z | 暂停命令 |
| Tab | 自动补全 |

## 总结

adb 是 Android 开发和调试的重要工具，掌握常用命令可以提高开发效率。
