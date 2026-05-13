---
title: SurfaceFlinger基础
date: 2025-01-01 10:00:00
tags:
    - android
    - graphics
    - SurfaceFlinger
    - 合成
categories:
    - android
    - graphics图形系统
---

## 简介

SurfaceFlinger 是 Android 图形系统的核心组件，负责将多个应用的图形缓冲区合成并显示到屏幕上。

## 核心职责

### 1. 缓冲区管理
- 接收应用提交的图形缓冲区
- 管理缓冲区的生命周期

### 2. 合成
- 将多个图层合成到一起
- 处理图层的变换和混合

### 3. 显示
- 将合成结果发送到显示器
- 管理 VSync 信号

## 架构

```
App 进程
    ↓ (BufferQueue)
SurfaceFlinger
    ↓ (Hardware Composer)
Display
```

## 工作流程

### 1. 接收缓冲区
```
App 绘制完成
    → 通过 BufferQueue 提交缓冲区
    → SurfaceFlinger 接收
```

### 2. 合成处理
```
SurfaceFlinger.onMessageReceived(INVALIDATE)
    → handleMessageInvalidat()
    → 合成所有图层
```

### 3. 显示输出
```
SurfaceFlinger.onMessageReceived(REFRESH)
    → handleMessageRefresh()
    → 提交到 Hardware Composer
    → 显示到屏幕
```

## VSync 机制

### App VSync
- 通知应用开始绘制
- 通过 Choreographer 管理

### SF VSync
- 通知 SurfaceFlinger 开始合成
- 保证合成时机正确

## 关键类

| 类名 | 职责 |
|------|------|
| SurfaceFlinger | 主服务 |
| Layer | 图层抽象 |
| BufferQueue | 缓冲区队列 |
| HWComposer | 硬件合成器 |

## 性能优化

1. **减少图层数量**
2. **避免不必要的合成**
3. **使用 Hardware Composer**
4. **合理使用 VSync**

## 总结

SurfaceFlinger 是 Android 图形系统的核心，负责将应用的图形内容合成并显示到屏幕上。
