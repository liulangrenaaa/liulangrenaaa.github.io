---
title: App绘制到SF合成流程
date: 2025-02-15 10:00:00
tags:
    - android
    - graphics
    - 绘制流程
    - SurfaceFlinger
categories:
    - android
    - graphics图形系统
---

## 简介

从应用开始绘制到最终显示在屏幕上，涉及多个系统组件的协作。

## 完整流程

### 1. 触发绘制
```
Choreographer.doFrame()
    → 处理 VSync 信号
    → 触发 CALLBACK_ANIMATION
    → 触发 CALLBACK_TRAVERSAL
```

### 2. View 绘制
```
ViewRootImpl.performTraversals()
    → performMeasure()
    → performLayout()
    → performDraw()
```

### 3. 硬件加速绘制
```
ThreadedRenderer.draw()
    → Canvas 录制绘制命令
    → RenderThread 执行
    → 提交到 BufferQueue
```

### 4. SurfaceFlinger 合成
```
SurfaceFlinger.onMessageReceived()
    → acquireBuffer()
    → 合成所有图层
    → 提交到 Display
```

## 关键节点

| 节点 | 说明 |
|------|------|
| VSync | 垂直同步信号 |
| Choreographer | 动画和绘制调度 |
| RenderThread | 渲染线程 |
| SurfaceFlinger | 图层合成 |
| Display | 显示输出 |

## 时间线

```
VSync 信号
    ↓
App 开始绘制 (16ms 内)
    ↓
提交缓冲区
    ↓
SF 合成
    ↓
显示到屏幕
```

## 性能优化

### 1. 减少绘制时间
- 优化布局复杂度
- 减少过度绘制

### 2. 优化 VSync
- 合理使用 Choreographer
- 避免跳帧

### 3. 使用硬件加速
- 启用 GPU 渲染
- 减少软件绘制

## 常见问题

### 掉帧
- 绘制超时
- SF 合成延迟
- Display 刷新率不匹配

### 卡顿
- 主线程阻塞
- RenderThread 阻塞
- 缓冲区积压

## 总结

App 绘制到显示是一个复杂的流程，涉及多个组件的协作，优化每个环节都可以提升用户体验。
