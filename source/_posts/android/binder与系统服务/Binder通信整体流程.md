---
title: Binder通信整体流程
date: 2024-10-01 10:00:00
tags:
    - android
    - binder
    - IPC
categories:
    - android
    - binder与系统服务
---

## 简介

Binder 是 Android 系统中最重要的进程间通信（IPC）机制，几乎所有系统服务调用都通过 Binder 实现。

## Binder 架构

### 核心组件
| 组件 | 职责 |
|------|------|
| Client | 发起调用的进程 |
| Server | 提供服务的进程 |
| ServiceManager | 管理服务注册和查找 |
| Binder Driver | 内核驱动，处理跨进程通信 |

## 通信流程

### 1. 服务注册
```
Server 进程
    → ServiceManager.addService("service_name", binder)
    → Binder Driver 处理
    → ServiceManager 记录
```

### 2. 服务获取
```
Client 进程
    → ServiceManager.getService("service_name")
    → 返回 BinderProxy
```

### 3. 方法调用
```
Client 调用方法
    → 代理对象序列化参数
    → 通过 Binder Driver 发送
    → Server 接收并处理
    → 返回结果
```

## 数据传输

### Parcel
- 序列化/反序列化数据
- 支持基本类型和复杂对象

### 传输限制
- 单次传输最大约 1MB
- 大数据需要使用共享内存

## 线程模型

### Binder 线程池
- 默认最大 16 个线程
- 异步处理 Binder 请求
- 线程阻塞会影响服务响应

## 性能优化

1. **减少 Binder 调用次数**
2. **避免大数据传输**
3. **使用异步调用**
4. **合理设置线程池大小**

## 总结

Binder 是 Android IPC 的核心，理解其工作原理对于分析系统性能和稳定性问题至关重要。
