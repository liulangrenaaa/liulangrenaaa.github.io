---
title: SurfaceControl.Transaction机制
date: 2024-05-01 10:00:00
tags:
    - android
    - SurfaceControl
    - SurfaceFlinger
    - 图形
categories:
    - android
    - wms窗口系统
slug: "android/wms窗口系统/SurfaceControl.Transaction机制"
---


## 简介

SurfaceControl.Transaction 是 Android 图形系统中控制窗口属性的核心机制，用于批量修改窗口的位置、大小、透明度等属性。

## 核心 API

### 常用操作
```java
SurfaceControl.Transaction t = new SurfaceControl.Transaction();

// 位置
t.setPosition(sc, x, y);

// 大小
t.setBufferSize(sc, width, height);

// 透明度
t.setAlpha(sc, alpha);

// 可见性
t.show(sc);
t.hide(sc);

// 层级
t.setLayer(sc, layer);

// 应用
t.apply();
```

## 批量操作

```java
SurfaceControl.Transaction t = new SurfaceControl.Transaction();
t.setPosition(sc1, x1, y1);
t.setPosition(sc2, x2, y2);
t.setAlpha(sc3, 0.5f);
t.apply(); // 一次性应用所有修改
```

## 在动画中的应用

### 位移动画
```java
ValueAnimator animator = ValueAnimator.ofFloat(0, 1);
animator.addUpdateListener(animation -> {
    float fraction = animation.getAnimatedFraction();
    SurfaceControl.Transaction t = new SurfaceControl.Transaction();
    t.setPosition(leash, startX + (endX - startX) * fraction, y);
    t.apply();
});
```

### 透明度动画
```java
ValueAnimator animator = ValueAnimator.ofFloat(1, 0);
animator.addUpdateListener(animation -> {
    float alpha = (float) animation.getAnimatedValue();
    SurfaceControl.Transaction t = new SurfaceControl.Transaction();
    t.setAlpha(leash, alpha);
    t.apply();
});
```

## 与 SurfaceFlinger 的关系

```
SurfaceControl.Transaction.apply()
    → 通过 Binder 发送到 SurfaceFlinger
    → SurfaceFlinger 处理事务
    → 更新显示
```

## 性能优化

1. **批量操作**：减少 Transaction 次数
2. **复用 Transaction**：避免频繁创建对象
3. **异步应用**：使用 applyAsync() 减少阻塞

## 总结

SurfaceControl.Transaction 是控制窗口属性的核心机制，通过批量操作可以高效地实现窗口动画和布局调整。
