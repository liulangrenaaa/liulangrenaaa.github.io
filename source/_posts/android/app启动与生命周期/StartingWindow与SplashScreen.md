---
title: StartingWindow与SplashScreen
date: 2024-01-01 10:00:00
tags:
    - android
    - StartingWindow
    - SplashScreen
    - 启动优化
categories:
    - android
    - app启动与生命周期
---

## 简介

StartingWindow（启动窗口）和 SplashScreen（闪屏）是应用启动过程中用户最先看到的界面，用于改善用户体验。

## StartingWindow

### 作用
- 在应用进程创建期间显示，避免用户看到空白屏幕
- 由 WMS 直接创建，不需要应用进程参与

### 类型
1. **Snapshot Window**：使用上次退出时的截图
2. **Splash Screen Window**：使用主题配置的背景

### 创建时机
```
ATMS.startActivity()
    → addStartingWindow()
    → WMS.addWindow()
```

## SplashScreen (Android 12+)

### 新特性
- 品牌化启动画面
- 支持动画效果
- 可自定义图标和背景

### 配置方式
```xml
<style name="AppTheme" parent="Theme.MaterialComponents">
    <item name="android:windowSplashScreenBackground">@color/white</item>
    <item name="android:windowSplashScreenAnimatedIcon">@drawable/icon</item>
</style>
```

## 消除时机

```
Activity.onResume()
    → WMS.removeStartingWindow()
    → 显示真正的 Activity 界面
```

## 最佳实践

1. 保持启动窗口简洁
2. 避免启动窗口与主界面差异过大
3. 合理配置 SplashScreen 属性

## 总结

StartingWindow 和 SplashScreen 是启动体验的重要组成部分，合理配置可以显著改善用户感知的启动速度。
