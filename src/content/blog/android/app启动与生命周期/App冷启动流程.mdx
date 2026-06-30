---
title: App冷启动流程
date: 2023-12-01 10:00:00
tags:
    - android
    - 启动流程
    - 冷启动
    - 性能优化
categories:
    - android
    - app启动与生命周期
slug: "android/app启动与生命周期/App冷启动流程"
---


## 简介

冷启动是指应用进程不存在，需要从零开始创建进程并启动 Activity 的过程。这是最耗时的启动方式。

## 冷启动流程

### 阶段一：进程创建
```
Launcher.startActivity()
    → ATMS.startActivity()
    → Zygote.fork()
    → ActivityThread.main()
```

### 阶段二：Application 初始化
```
ActivityThread.handleBindApplication()
    → Application.onCreate()
```

### 阶段三：Activity 创建
```
ActivityThread.handleLaunchActivity()
    → Activity.onCreate()
    → Activity.onStart()
    → Activity.onResume()
```

### 阶段四：首帧绘制
```
ViewRootImpl.performTraversals()
    → measure → layout → draw
    → SurfaceFlinger 合成显示
```

## 关键时间节点

| 节点 | 说明 |
|------|------|
| fork() | 进程创建完成 |
| bindApplication | Application 开始初始化 |
| onCreate | Activity 开始创建 |
| onResume | Activity 可见 |
| 首帧绘制 | 用户看到界面 |

## 性能优化方向

1. **减少 Application 初始化时间**
   - 延迟初始化
   - 异步初始化

2. **优化 Activity 创建**
   - 减少布局复杂度
   - 预加载资源

3. **优化首帧绘制**
   - 减少过度绘制
   - 优化 measure/layout

## 总结

冷启动涉及进程创建、Application 初始化、Activity 创建和首帧绘制四个阶段，每个阶段都有优化空间。
