---
title: AppTransition机制
date: 2024-03-15 10:00:00
tags:
    - android
    - WMS
    - AppTransition
    - 动画
categories:
    - android
    - wms窗口系统
slug: "android/wms窗口系统/AppTransition机制"
---


## 简介

AppTransition 负责处理应用切换时的过渡动画，包括 Activity 启动、返回等场景。

## 触发时机

### 启动动画
```
ATMS.startActivity()
    → AppTransition.goodToGo()
    → 播放启动动画
```

### 返回动画
```
Activity.onBackPressed()
    → AppTransition.goodToGo()
    → 播放返回动画
```

## 动画类型

| 类型 | 说明 |
|------|------|
| TRANSIT_NONE | 无动画 |
| TRANSIT_OPEN | 打开动画 |
| TRANSIT_CLOSE | 关闭动画 |
| TRANSIT_TO_FRONT | 移到前台动画 |
| TRANSIT_TO_BACK | 移到后台动画 |

## 自定义动画

### 方式一：overridePendingTransition
```java
startActivity(intent);
overridePendingTransition(R.anim.slide_in, R.anim.slide_out);
```

### 方式二：Style 配置
```xml
<style name="AppTheme">
    <item name="android:windowAnimationStyle">@style/WindowAnimation</item>
</style>
```

## 动画执行流程

```
AppTransition.goodToGo()
    → AppTransitionController.handleAppTransitionReady()
    → 播放动画
    → 动画结束回调
    → 窗口状态更新
```

## 与 ShellTransition 的关系

Android 12+ 引入了 ShellTransition，逐步取代 AppTransition，提供更灵活的动画框架。

## 总结

AppTransition 是 Android 窗口动画的核心机制，负责管理应用切换时的过渡效果。
