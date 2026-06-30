---
title: Activity生命周期与窗口创建
date: 2024-01-15 10:00:00
tags:
    - android
    - Activity
    - 生命周期
    - Window
categories:
    - android
    - app启动与生命周期
slug: "android/app启动与生命周期/Activity生命周期与窗口创建"
---


## 简介

Activity 的生命周期与窗口创建紧密相关，理解两者的对应关系有助于分析界面显示问题。

## 生命周期与窗口对应关系

```
onCreate()
    → PhoneWindow 创建
    → DecorView 创建
    → setContentView()

onStart()
    → Activity 可见

onResume()
    → Window 添加到 WMS
    → ViewRootImpl 创建
    → 窗口可见

onPause()
    → 窗口失去焦点

onStop()
    → 窗口不可见

onDestroy()
    → Window 移除
```

## 窗口创建详细流程

### onCreate 阶段
```
Activity.onCreate()
    → new PhoneWindow()
    → setContentView()
        → LayoutInflater.inflate()
        → 创建 DecorView
```

### onResume 阶段
```
Activity.onResume()
    → WindowManager.addView()
        → new ViewRootImpl()
        → WMS.addWindow()
        → requestLayout()
```

### 首帧绘制
```
ViewRootImpl.performTraversals()
    → performMeasure()
    → performLayout()
    → performDraw()
    → SurfaceFlinger 合成
```

## 常见问题

1. **窗口泄漏**：Activity 销毁时未正确移除窗口
2. **黑屏**：onCreate 耗时过长，StartingWindow 已移除但 Activity 界面未就绪
3. **白屏**：布局复杂，首帧绘制耗时

## 总结

Activity 的生命周期与窗口创建是同步进行的，onResume 完成后窗口才真正可见，首帧绘制完成后用户才能看到界面。
