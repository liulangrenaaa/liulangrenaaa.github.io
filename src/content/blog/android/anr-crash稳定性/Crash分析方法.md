---
title: Crash分析方法
date: 2025-05-15 10:00:00
tags:
    - android
    - Crash
    - 稳定性
categories:
    - android
    - anr-crash稳定性
slug: "android/anr-crash稳定性/Crash分析方法"
---


## 简介

应用崩溃（Crash）是常见的稳定性问题，本文介绍 Crash 的分析方法。

## Crash 类型

### 1. Java Crash
- 未捕获的异常
- 空指针、数组越界等

### 2. Native Crash
- 段错误、空指针
- 信号 SIGSEGV、SIGABRT 等

### 3. ANR
- 应用无响应
- 主线程阻塞

## 日志分析

### Java Crash
```
FATAL EXCEPTION: main
    Process: com.example.app, PID: 12345
    java.lang.NullPointerException: Attempt to invoke...
        at com.example.app.MainActivity.onClick(MainActivity.java:100)
```

### Native Crash
```
pid: 12345, tid: 12345, name: main  >>> com.example.app <<<
signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0
    #00 pc 0000000000001234  /system/lib64/libc.so (strlen+16)
```

## 分析步骤

### 1. 定位崩溃位置
- 查看堆栈信息
- 定位到具体代码行

### 2. 分析崩溃原因
- 空指针：检查对象初始化
- 数组越界：检查数组边界
- 类型转换：检查类型兼容性

### 3. 复现和验证
- 尝试复现问题
- 验证修复方案

## 调试命令

### 查看崩溃日志
```bash
adb logcat -b crash
```

### 查看 tombstone
```bash
adb shell ls /data/tombstones/
adb pull /data/tombstones/tombstone_00
```

### 查看进程状态
```bash
adb shell ps -A | grep <package>
```

## 常见场景

### 1. 空指针异常
```java
String str = null;
str.length(); // NullPointerException
```

### 2. 数组越界
```java
int[] arr = new int[5];
arr[10] = 1; // ArrayIndexOutOfBoundsException
```

### 3. 类型转换异常
```java
Object obj = "string";
Integer num = (Integer) obj; // ClassCastException
```

## 预防措施

1. 使用空安全操作符（Kotlin）
2. 进行边界检查
3. 使用 try-catch 处理异常
4. 进行充分的测试

## 总结

Crash 分析关键是查看堆栈信息和定位崩溃原因，通过代码审查和测试预防崩溃发生。
