---
title: Launcher点击App启动流程
date: 2023-12-15 10:00:00
tags:
    - android
    - Launcher
    - 启动流程
categories:
    - android
    - app启动与生命周期
slug: "android/app启动与生命周期/Launcher点击App启动流程"
---


## 简介

从用户点击 Launcher 上的应用图标到应用显示，涉及多个系统组件的协作。

## 完整流程

### 1. Launcher 处理点击
```
Launcher.onClick()
    → startActivitySafely()
    → Activity.startActivity()
```

### 2. AMS/ATMS 处理
```
ATMS.startActivity()
    → startActivityAsUser()
    → ActivityStarter.execute()
    → resolveIntent()
    → startActivityUnchecked()
```

### 3. 进程创建（冷启动）
```
ATMS.startProcessAsync()
    → ZygoteProcess.start()
    → Zygote.forkAndSpecialize()
```

### 4. Activity 启动
```
ActivityThread.handleLaunchActivity()
    → performLaunchActivity()
    → Activity.onCreate()
```

## 涉及的进程

| 进程 | 职责 |
|------|------|
| Launcher | 发起启动请求 |
| system_server | 处理启动逻辑 |
| Zygote | fork 新进程 |
| App 进程 | 执行 Activity 生命周期 |

## 关键类

- ActivityStarter：负责 Activity 启动的核心逻辑
- ActivityStack：管理 Activity 任务栈
- ActivityRecord：Activity 的记录
- ProcessRecord：进程记录

## 总结

Launcher 点击启动应用涉及 Launcher、system_server、Zygote 和 App 四个进程的协作，通过 Binder 和 Socket 进行通信。
