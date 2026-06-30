---
title: ShellTransition机制
date: 2024-04-01 10:00:00
tags:
    - android
    - WMS
    - ShellTransition
    - 动画
    - Android12
categories:
    - android
    - wms窗口系统
slug: "android/wms窗口系统/ShellTransition机制"
---


## 简介

ShellTransition 是 Android 12 引入的新过渡动画框架，取代传统的 AppTransition，提供更灵活、更强大的动画能力。

## 核心概念

### Transition
- 代表一次窗口状态变化
- 包含参与变化的窗口集合

### TransitionInfo
- 过渡信息，包含窗口变化的详细信息
- 用于动画计算

### TransitionHandler
- 动画处理器
- 负责计算和执行动画

## 与 AppTransition 的区别

| 特性 | AppTransition | ShellTransition |
|------|---------------|-----------------|
| 架构 | WMS 内部 | Shell 进程 |
| 灵活性 | 有限 | 高度可扩展 |
| 自定义能力 | 弱 | 强 |
| 跨进程动画 | 不支持 | 支持 |

## 执行流程

```
WMS.requestTransition()
    → TransitionController.collectTransitionInfo()
    → Shell 进程处理
    → TransitionHandler.playAnimation()
    → 动画完成回调
```

## 自定义 TransitionHandler

```java
public class CustomTransitionHandler extends TransitionHandler {
    @Override
    public boolean startAnimation(TransitionInfo info, ...) {
        // 自定义动画逻辑
        return true;
    }
}
```

## 优势

1. **模块化**：动画逻辑独立于 WMS
2. **可扩展**：支持自定义动画处理器
3. **跨进程**：支持 Shell 进程动画
4. **性能**：更好的动画性能

## 总结

ShellTransition 是 Android 动画系统的重大升级，提供了更现代、更灵活的动画框架。
