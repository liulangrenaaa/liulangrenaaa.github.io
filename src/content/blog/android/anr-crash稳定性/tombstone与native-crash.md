---
title: tombstone与native-crash
date: 2025-06-01 10:00:00
tags:
    - android
    - native crash
    - tombstone
    - 稳定性
categories:
    - android
    - anr-crash稳定性
slug: "android/anr-crash稳定性/tombstone与native-crash"
---


## 简介

tombstone 是 Android 系统中记录 Native Crash 信息的文件，本文介绍如何分析 Native Crash。

## 什么是 tombstone

### 定义
- Native Crash 的核心转储文件
- 包含崩溃时的寄存器、堆栈、内存等信息
- 保存在 /data/tombstones/ 目录

### 触发条件
- SIGSEGV（段错误）
- SIGABRT（中止）
- SIGBUS（总线错误）
- 其他信号

## tombstone 结构

### 头部信息
```
pid: 12345, tid: 12345, name: main  >>> com.example.app <<<
uid: 10001
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0
```

### 寄存器信息
```
    x0  0000000000000000  x1  0000007b12345678  x2  0000000000000001  x3  0000000000000002
    ...
```

### 堆栈信息
```
backtrace:
    #00 pc 0000000000001234  /system/lib64/libc.so (strlen+16)
    #01 pc 0000000000005678  /data/app/com.example.app/lib/arm64/libnative.so (Java_com_example_app_NativeMethod+100)
```

## 分析步骤

### 1. 获取 tombstone
```bash
adb pull /data/tombstones/tombstone_00
```

### 2. 分析信号类型
| 信号 | 说明 |
|------|------|
| SIGSEGV | 段错误，访问无效内存 |
| SIGABRT | 主动中止，assert 失败 |
| SIGBUS | 总线错误，内存对齐问题 |

### 3. 分析堆栈
- 定位崩溃函数
- 查找崩溃原因

### 4. 使用 addr2line 解析地址
```bash
aarch64-linux-android-addr2line -C -f -e libnative.so 0000000000001234
```

## 常见场景

### 1. 空指针访问
```
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0
```

### 2. 内存越界
```
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0xdeadbeef
```

### 3. assert 失败
```
signal 6 (SIGABRT), code -1 (SI_QUEUE)
```

## 调试命令

### 查看 tombstone 列表
```bash
adb shell ls -la /data/tombstones/
```

### 清除 tombstone
```bash
adb shell rm /data/tombstones/*
```

### 设置 tombstone 保存数量
```bash
adb shell setprop persist.sys.tombstones.max 50
```

## 预防措施

1. 进行充分的内存检查
2. 使用内存检测工具（ASan、HWASan）
3. 避免野指针和悬空指针
4. 进行充分的测试

## 总结

tombstone 是分析 Native Crash 的重要工具，通过分析堆栈和寄存器信息可以定位崩溃原因。
