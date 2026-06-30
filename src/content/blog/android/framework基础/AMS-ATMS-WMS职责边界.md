---
title: AMS-ATMS-WMS职责边界
date: 2023-10-01 10:00:00
tags:
    - android
    - framework
    - AMS
    - ATMS
    - WMS
categories:
    - android
    - framework基础
slug: "android/framework基础/AMS-ATMS-WMS职责边界"
---


## 简介

AMS（ActivityManagerService）、ATMS（ActivityTaskManagerService）和 WMS（WindowManagerService）是 Android 系统中最重要的三个服务，它们共同管理着应用的界面和交互。

## 职责划分

### AMS (ActivityManagerService)
- 管理 Activity、Service、BroadcastReceiver、ContentProvider 的生命周期
- 进程管理（创建、销毁、优先级调整）
- 任务栈管理

### ATMS (ActivityTaskManagerService)
- Android 10 从 AMS 中分离出来
- 专门负责 Activity 和 Task 的管理
- 窗口模式管理（分屏、画中画等）

### WMS (WindowManagerService)
- 窗口的添加、删除、更新
- 窗口层级管理
- 窗口动画
- 输入事件分发

## 协作关系

```
App 进程
    ↓ Binder
ATMS (Activity 管理)
    ↓
WMS (窗口管理)
    ↓
SurfaceFlinger (显示)
```

## 典型流程

### Activity 启动流程中的协作
1. ATMS：处理 Activity 启动请求，管理 Task
2. AMS：管理进程生命周期
3. WMS：创建窗口，管理窗口层级

## 总结

AMS 负责组件和进程管理，ATMS 负责 Activity 和任务管理，WMS 负责窗口管理。三者各司其职，共同保证 Android 界面系统的正常运行。
