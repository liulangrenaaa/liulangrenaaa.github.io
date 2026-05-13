---
title: Android系统服务注册与获取
date: 2023-10-15 10:00:00
tags:
    - android
    - framework
    - ServiceManager
    - Binder
categories:
    - android
    - framework基础
---

## 简介

Android 系统服务是系统功能的核心，应用通过 ServiceManager 获取系统服务的代理对象。

## 服务注册

### 注册流程
```
SystemServer.startXxxService()
    └── ServiceManager.addService("xxx", service)
        └── 向 ServiceManager 注册 Binder 代理
```

### 服务注册表
ServiceManager 维护了一个服务名到 Binder 代理的映射表。

## 服务获取

### 获取流程
```
Context.getSystemService("xxx")
    └── ServiceManager.getService("xxx")
        └── 返回 Binder 代理对象
```

### 常用服务获取方式
```java
// 方式一：通过 Context
ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);

// 方式二：直接通过 ServiceManager
IBinder binder = ServiceManager.getService("activity");
```

## 核心类

| 类名 | 职责 |
|------|------|
| ServiceManager | 管理所有系统服务的注册和获取 |
| IServiceManager | ServiceManager 的 Binder 接口 |
| SystemServiceManager | 管理系统服务的生命周期 |

## 服务分类

1. **本地服务**：运行在 SystemServer 进程
2. **远程服务**：运行在独立进程（如 SurfaceFlinger）

## 总结

系统服务通过 ServiceManager 进行注册和管理，应用通过 Binder 机制获取服务代理，实现跨进程调用。
