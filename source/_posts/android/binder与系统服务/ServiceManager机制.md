---
title: ServiceManager机制
date: 2024-11-01 10:00:00
tags:
    - android
    - binder
    - ServiceManager
categories:
    - android
    - binder与系统服务
---

## 简介

ServiceManager 是 Android 系统中管理所有系统服务的核心组件，负责服务的注册和查找。

## 核心功能

### 1. 服务注册
```
Server 进程
    → ServiceManager.addService("name", service)
    → 记录服务名和 Binder 引用
```

### 2. 服务查找
```
Client 进程
    → ServiceManager.getService("name")
    → 返回 Binder 代理对象
```

### 3. 服务列表
```
ServiceManager.listServices()
    → 返回所有已注册的服务
```

## 启动流程

### 1. init 进程启动
```
init.rc
    → 启动 servicemanager 进程
```

### 2. 初始化
```
ServiceManager.main()
    → 打开 /dev/binder
    → 注册自己为服务
    → 循环等待请求
```

## 服务注册流程

```
Server 调用 addService()
    → 通过 Binder 发送到 ServiceManager
    → ServiceManager 验证权限
    → 记录服务信息
    → 返回成功
```

## 服务查找流程

```
Client 调用 getService()
    → 通过 Binder 发送到 ServiceManager
    → 查找服务记录
    → 返回 Binder 引用
```

## 权限控制

### SELinux 策略
- 控制哪些进程可以注册服务
- 控制哪些进程可以查找服务

### 常见服务权限
| 服务 | 注册权限 | 查找权限 |
|------|----------|----------|
| activity | system_server | 所有进程 |
| surfaceflinger | surfaceflinger | 所有进程 |
| media | mediaserver | 所有进程 |

## 调试方法

### 查看已注册服务
```bash
adb shell service list
```

### 查看服务详情
```bash
adb shell dumpsys activity services
```

## 总结

ServiceManager 是 Android 服务架构的基石，理解其工作原理有助于分析系统服务相关问题。
