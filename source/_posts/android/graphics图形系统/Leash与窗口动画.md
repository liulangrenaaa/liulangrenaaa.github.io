---
title: Leash与窗口动画
date: 2025-03-01 10:00:00
tags:
    - android
    - graphics
    - Leash
    - 动画
categories:
    - android
    - graphics图形系统
---

## 简介

Leash 是 Android 窗口动画系统中的重要概念，用于实现窗口的变换动画。

## 什么是 Leash

### 定义
- 一个中间的 SurfaceControl
- 位于父图层和子图层之间
- 用于控制动画变换

### 作用
- 隔离动画和实际窗口状态
- 支持复杂的动画效果
- 保持窗口状态稳定

## Leash 的创建

### 时机
```
WMS 准备动画
    → 创建 Leash SurfaceControl
    → 将窗口挂载到 Leash 下
```

### 结构
```
父图层
    ↓
Leash
    ↓
窗口图层
```

## 动画执行

### 位移动画
```java
SurfaceControl.Transaction t = new SurfaceControl.Transaction();
t.setPosition(leash, x, y);
t.apply();
```

### 缩放动画
```java
SurfaceControl.Transaction t = new SurfaceControl.Transaction();
t.setMatrix(leash, scaleX, 0, 0, scaleY);
t.apply();
```

### 透明度动画
```java
SurfaceControl.Transaction t = new SurfaceControl.Transaction();
t.setAlpha(leash, alpha);
t.apply();
```

## 与 ShellTransition 的协作

```
ShellTransition 检测变化
    → 创建 Leash
    → 执行动画
    → 动画完成
    → 移除 Leash
```

## 常见动画类型

| 类型 | 说明 |
|------|------|
| 启动动画 | Activity 启动时的动画 |
| 返回动画 | Activity 返回时的动画 |
| 旋转动画 | 屏幕旋转时的动画 |
| 多窗口动画 | 分屏、画中画动画 |

## 性能优化

1. **减少 Leash 层级**
2. **合理使用动画时长**
3. **避免复杂的动画效果**
4. **使用硬件加速**

## 调试方法

### 查看 Leash 结构
```bash
adb shell dumpsys SurfaceFlinger
```

### 查看动画状态
```bash
adb shell dumpsys window animator
```

## 总结

Leash 是 Android 窗口动画的核心机制，通过中间层隔离动画和窗口状态，实现了流畅的动画效果。
