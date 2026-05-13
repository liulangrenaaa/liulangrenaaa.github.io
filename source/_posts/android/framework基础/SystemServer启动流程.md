---
title: SystemServer启动流程
date: 2023-09-20 10:00:00
tags:
    - android
    - framework
    - system_server
    - 启动流程
categories:
    - android
    - framework基础
---

## 简介

SystemServer 是 Android 系统的核心进程，负责启动和管理所有的系统服务。

## 启动流程

### 1. Zygote 进程启动
```
init进程
    └── app_process (Zygote)
        └── ZygoteInit.main()
            └── forkSystemServer()
```

### 2. SystemServer 启动
```
Zygote.forkSystemServer()
    └── handleSystemServerProcess()
        └── ZygoteInit.zygoteInit()
            └── RuntimeInit.applicationInit()
                └── SystemServer.main()
```

### 3. 系统服务启动
```
SystemServer.run()
    └── startBootstrapServices()
        └── startCoreServices()
            └── startOtherServices()
```

## 核心服务

| 服务 | 职责 |
|------|------|
| AMS | Activity 管理 |
| WMS | 窗口管理 |
| PMS | 包管理 |
| IMS | 输入管理 |
| DisplayManagerService | 显示管理 |

## 启动顺序

1. **引导服务**：AMS、PMS、PowerManagerService 等
2. **核心服务**：BatteryService、UsageStatsService 等
3. **其他服务**：WMS、InputManagerService、NetworkManagementService 等

## 总结

SystemServer 是 Android 系统的中枢，它启动所有系统服务并管理它们的生命周期。理解 SystemServer 的启动流程对于分析系统问题至关重要。
