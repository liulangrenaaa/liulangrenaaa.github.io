---
title: WMS窗口层级结构
date: 2024-03-01 10:00:00
tags:
    - android
    - WMS
    - 窗口层级
categories:
    - android
    - wms窗口系统
slug: "android/wms窗口系统/WMS窗口层级结构"
---


## 简介

WMS 通过层级（Layer）来管理窗口的显示顺序，不同类型的窗口位于不同的层级。

## 窗口层级

### 主要层级

| 层级范围 | 窗口类型 | 示例 |
|----------|----------|------|
| 1-99 | 应用窗口 | Activity |
| 1000-1999 | 子窗口 | PopupWindow、Dialog |
| 2000-2999 | 系统窗口 | StatusBar、NavigationBar |
| 3000+ | 特殊窗口 | 输入法、壁纸 |

### 层级定义
```java
// 应用窗口
FIRST_APPLICATION_WINDOW = 1;
LAST_APPLICATION_WINDOW = 99;

// 子窗口
FIRST_SUB_WINDOW = 1000;
LAST_SUB_WINDOW = 1999;

// 系统窗口
FIRST_SYSTEM_WINDOW = 2000;
LAST_SYSTEM_WINDOW = 2999;
```

## WindowToken 与 WindowState

### WindowToken
- 窗口令牌，代表一组相关窗口
- 用于权限验证和窗口分组

### WindowState
- 窗口状态，代表一个具体的窗口
- 包含窗口的位置、大小、层级等信息

## 层级调整

```
WMS.addWindow()
    → assignLayer()
    → 调整窗口层级
    → SurfaceFlinger 合成
```

## 特殊窗口类型

1. **TYPE_STATUS_BAR**：状态栏
2. **TYPE_NAVIGATION_BAR**：导航栏
3. **TYPE_INPUT_METHOD**：输入法
4. **TYPE_WALLPAPER**：壁纸
5. **TYPE_SYSTEM_ALERT**：系统弹窗

## 总结

WMS 通过层级结构管理窗口显示顺序，不同类型的窗口位于不同层级，确保界面显示的正确性。
