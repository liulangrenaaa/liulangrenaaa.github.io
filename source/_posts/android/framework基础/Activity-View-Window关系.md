---
title: Activity-View-Window关系
date: 2023-09-15 10:00:00
tags:
    - android
    - framework
    - Activity
    - View
    - Window
categories:
    - android
    - framework基础
---

## 简介

Android 应用界面由 Activity、View、Window 三个核心组件构成，它们之间的关系是理解 Android UI 系统的基础。

## 三者关系

### Activity
Activity 是 Android 四大组件之一，负责管理用户的交互界面。它不直接负责绘制，而是通过 Window 来承载 View。

### Window
Window 是窗口的抽象，每个 Activity 都对应一个 Window。在 Android 中，Window 的唯一实现是 PhoneWindow。

### View
View 是界面元素的基本单位，所有的 UI 控件都是 View 的子类。View 通过 ViewRootImpl 与 Window 建立联系。

## 创建流程

```
Activity.onCreate()
    └── setContentView()
        └── PhoneWindow.setContentView()
            └── LayoutInflater.inflate()
                └── 创建 View 树
```

## 关键类

| 类名 | 职责 |
|------|------|
| Activity | 管理生命周期和用户交互 |
| PhoneWindow | Window 的实现，承载 DecorView |
| DecorView | 根 View，包含标题栏和内容区 |
| ViewRootImpl | 连接 View 和 WindowManager |
| WindowManagerService | 管理所有窗口 |

## 总结

Activity 是用户交互的入口，Window 是窗口的抽象表示，View 是实际的界面元素。三者协同工作，构成了 Android 的 UI 系统。
