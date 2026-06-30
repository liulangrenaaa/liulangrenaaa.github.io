---
title: RemoteAnimation机制
date: 2024-04-15 10:00:00
tags:
    - android
    - WMS
    - RemoteAnimation
    - 动画
categories:
    - android
    - wms窗口系统
slug: "android/wms窗口系统/RemoteAnimation机制"
---


## 简介

RemoteAnimation 允许第三方应用（如 Launcher）自定义窗口动画，常用于实现自定义的启动和返回动画。

## 核心接口

### IRemoteAnimationRunner
```java
public interface IRemoteAnimationRunner {
    void onAnimationStart(RemoteAnimationTarget[] apps,
                         RemoteAnimationTarget[] wallpapers,
                         IRemoteAnimationFinishedCallback callback);
    void onAnimationCancelled();
}
```

### RemoteAnimationTarget
- 代表参与动画的窗口
- 包含窗口的位置、大小、Surface 等信息

## 使用场景

1. **Launcher 启动动画**
2. **自定义返回手势动画**
3. **多窗口切换动画**

## 实现流程

### 1. 注册动画
```java
WindowManager wm = getSystemService(WindowManager.class);
wm.registerRemoteAnimations(runner, definition);
```

### 2. 动画执行
```
WMS 检测到窗口变化
    → 通知已注册的 RemoteAnimationRunner
    → Runner 执行自定义动画
    → 动画完成回调
```

### 3. 动画控制
```java
// 获取 SurfaceControl
SurfaceControl leash = appInfo.leash;

// 执行动画
SurfaceControl.Transaction t = new SurfaceControl.Transaction();
t.setPosition(leash, x, y);
t.apply();
```

## 与 ShellTransition 的关系

RemoteAnimation 与 ShellTransition 可以共存，ShellTransition 提供了更底层的动画能力。

## 注意事项

1. 需要系统权限
2. 动画执行期间窗口状态被冻结
3. 需要正确处理动画取消

## 总结

RemoteAnimation 为第三方应用提供了自定义窗口动画的能力，是实现个性化动画效果的重要机制。
