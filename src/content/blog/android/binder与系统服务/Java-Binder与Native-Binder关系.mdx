---
title: Java-Binder与Native-Binder关系
date: 2024-11-15 10:00:00
tags:
    - android
    - binder
    - JNI
    - 框架
categories:
    - android
    - binder与系统服务
slug: "android/binder与系统服务/Java-Binder与Native-Binder关系"
---


## 简介

Android Binder 分为 Java 层和 Native 层，两者通过 JNI 桥接，共同构成完整的 Binder 通信机制。

## 层次结构

```
Java 层
    ↓ JNI
Native 层
    ↓ ioctl
Kernel 层 (Binder Driver)
```

## Java 层 Binder

### 核心类
| 类名 | 职责 |
|------|------|
| IBinder | Binder 接口 |
| Binder | 本地 Binder 实现 |
| BinderProxy | 远程 Binder 代理 |
| Parcel | 数据序列化 |

### 使用方式
```java
// 服务端
public class MyService extends Binder {
    @Override
    protected boolean onTransact(int code, Parcel data, Parcel reply, int flags) {
        // 处理请求
    }
}

// 客户端
IBinder binder = ServiceManager.getService("my_service");
Parcel data = Parcel.obtain();
Parcel reply = Parcel.obtain();
binder.transact(METHOD_CODE, data, reply, 0);
```

## Native 层 Binder

### 核心类
| 类名 | 职责 |
|------|------|
| BpBinder | 远程代理 |
| BBinder | 本地实现 |
| IPCThreadState | 线程状态管理 |
| ProcessState | 进程状态管理 |

### 使用方式
```cpp
// 服务端
class MyService : public BnInterface<IMyService> {
    status_t onTransact(uint32_t code, const Parcel& data, Parcel* reply, uint32_t flags) {
        // 处理请求
    }
};

// 客户端
sp<IMyService> service = interface_cast<IMyService>(ServiceManager::getService("my_service"));
service->doSomething();
```

## JNI 桥接

### 注册过程
```
AndroidRuntime.start()
    → register_android_os_Binder()
    → 注册 JNI 方法
```

### 关键 JNI 方法
```cpp
// Java 调用 Native
static jboolean android_os_BinderProxy_transact(JNIEnv* env, jobject obj,
    jint code, jobject dataObj, jobject replyObj, jint flags) {
    // 调用 BpBinder->transact()
}
```

## 选择建议

### 使用 Java Binder
- 应用层服务
- 需要与 Java 框架交互
- 开发效率优先

### 使用 Native Binder
- 系统底层服务
- 性能要求高
- 需要直接访问硬件

## 总结

Java Binder 和 Native Binder 通过 JNI 桥接，开发者可以根据需求选择合适的层次进行开发。
