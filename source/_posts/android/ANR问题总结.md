---
title: ANR问题总结
date: 2022-07-01 19:00:40
sticky: 100
tags:
    - android
    - ANR
    - android framework
categories:
    - android
---


## 简介
ANR是一套监控Android应用响应是否及时的机制，可以把发生ANR比作是引爆炸弹，那么整个流程包含三部分组成：

1. 埋定时炸弹：中控系统(system_server进程)启动倒计时，在规定时间内如果目标(应用进程)没有干完所有的活，则中控系统会定向炸毁(杀进程)目标。
2. 拆炸弹：在规定的时间内干完工地的所有活，并及时向中控系统报告完成，请求解除定时炸弹，则幸免于难。
3. 引爆炸弹：中控系统立即封装现场，抓取快照，搜集目标执行慢的罪证(traces)，便于后续的案件侦破(调试分析)，最后是炸毁目标。

ANR（App Not Responding）基本上99%的App都有，即使是系统，也有system_anr，我相信虽然ANR问题这样的普遍，还是有很多人对ANR问题即熟悉又陌生的，ANR中log信息怎么看？发生的场景有哪些？广播会发生ANR吗？我的App啥事都没有干怎么发生了ANR了等等一些问题，今天通过三个案例总结一下ANR问题分析的一般套路，以做备忘。

### ANR触发机制整体流程

```mermaid
sequenceDiagram
    participant SS as system_server
    participant AS as AMS(ActivityManagerService)
    participant NH as NH(Handler)
    participant App as App进程
    participant BT as Binder线程

    Note over SS,BT: 埋炸弹阶段 - 启动倒计时
    AS->>NH: sendMessageDelayed(msg, timeout)
    Note right of NH: 开始倒计时<br/>Input: 5s<br/>Service: 20s/200s<br/>Broadcast: 10s/60s

    alt 正常完成
        App->>AS: 任务完成通知
        AS->>NH: removeMessages(msg)
        Note right of NH: 拆弹成功 ✅
    else 超时未完成
        Note right of NH: 倒计时结束 💣
        NH->>AS: 触发超时处理
        AS->>AS: 检查进程状态
        AS->>App: 发送SIGQUIT信号
        Note over App: 收集traces
        AS->>App: killProcess()
        Note over App: 进程被杀 💥
    end
```

### Input事件ANR详细流程

```mermaid
flowchart TD
    A[InputManager产生输入事件] --> B[InputDispatcher分发事件]
    B --> C{事件类型?}
    C -->|KeyEvent| D[分发到FocusedWindow]
    C -->|MotionEvent| E[分发到TouchedWindow]
    D --> F[通过InputChannel发送]
    E --> F
    F --> G[App进程接收事件]
    G --> H{5s内处理完成?}
    H -->|是| I[正常响应 ✅]
    H -->|否| J[触发ANR]
    J --> K[InputDispatcher检测超时]
    K --> L[通知system_server]
    L --> M[AMS处理ANR]
    M --> N{显示ANR对话框?}
    N -->|用户选择等待| O[继续执行]
    N -->|用户选择关闭| P[kill进程]
    N -->|后台进程| Q[直接kill]

    style A fill:#e1f5fe
    style J fill:#ffebee
    style P fill:#ffcdd2
    style Q fill:#ffcdd2
```

### Service ANR处理流程

```mermaid
stateDiagram-v2
    [*] --> 启动Service
    启动Service --> 发送超时消息: ActiveServices.realStartServiceLocked()
    发送超时消息 --> 等待完成: sendMessageDelayed(SERVICE_TIMEOUT_MSG)

    等待完成 --> 正常完成: serviceDoneExecuting()
    等待完成 --> 超时触发: 超过时间限制

    正常完成 --> 移除消息: removeMessages()
    移除消息 --> [*]: 正常结束 ✅

    超时触发 --> 收集信息: ActiveServices.serviceTimeout()
    收集信息 --> 获取traces: dumpStackTraces()
    获取traces --> 弹出ANR对话框: mAppErrors.appNotResponding()

    弹出ANR对话框 --> 用户等待: 点击Wait
    弹出ANR对话框 --> 用户关闭: 点击Close
    弹出ANR对话框 --> 后台进程: 直接kill

    用户等待 --> [*]: 继续执行
    用户关闭 --> kill进程: Process.killProcess()
    kill进程 --> [*]: 进程死亡 💀
```

### ANR信息收集与分析流程

```mermaid
flowchart LR
    subgraph 触发["ANR触发"]
        A1[Input超时]
        A2[Service超时]
        A3[Broadcast超时]
        A4[Provider超时]
    end

    subgraph 收集["信息收集"]
        B1[获取traces文件]
        B2[收集CPU使用情况]
        B3[收集Binder信息]
        B4[收集内存信息]
        B5[收集IO信息]
    end

    subgraph 分析["问题分析"]
        C1{主线程状态?}
        C2[Blocked - 等待锁]
        C3[Waiting - 等待唤醒]
        C4[Runnable - CPU密集]
        C5[Native - 系统调用]
    end

    subgraph 原因["常见原因"]
        D1[死锁]
        D2[耗时操作]
        D3[Binder阻塞]
        D4[CPU/IO竞争]
        D5[内存不足]
    end

    触发 --> 收集
    收集 --> 分析
    C1 -->|monitor contention| C2
    C1 -->|Object.wait| C3
    C1 -->|CPU usage高| C4
    C1 -->|native调用| C5
    C2 --> D1
    C3 --> D3
    C4 --> D2
    C4 --> D4
    C5 --> D5

    style 触发 fill:#fff3e0
    style 收集 fill:#e3f2fd
    style 分析 fill:#f3e5f5
    style 原因 fill:#ffebee
```

### Binder阻塞导致ANR的复杂场景

```mermaid
sequenceDiagram
    participant Main as 主线程
    participant BT as Binder线程池
    participant Remote as 远程进程
    participant SS as system_server

    Note over Main,SS: 场景: Binder线程池被占满

    Main->>BT: 发起Binder调用
    Note right of BT: Binder线程池已满(16个)

    par 并行Binder请求
        BT->>Remote: 请求1
        BT->>Remote: 请求2
        BT->>Remote: ...
        BT->>Remote: 请求16
    end

    Note right of Remote: 远程进程繁忙<br/>无法及时响应

    Main->>BT: 新的Binder请求
    Note right of BT: 无法分配线程<br/>阻塞等待

    SS->>Main: 检测超时
    Note over Main: ANR触发!<br/>主线程被Binder阻塞

    Remote-->>BT: 响应请求1
    BT-->>Main: 返回结果
    Note over Main: 为时已晚<br/>进程已被kill
```

## 问题分析
一句话总结ANR原因：`没有在规定的时间内，干完要干的事情，就会发生ANR`，就是 `system server` 在指定时间内没有收到应用发送的 binder call。

### 场景分类
1. Input事件超过5s没有被处理完
2. Service处理超时，前台20s，后台200s
3. BroadcastReceiver处理超时，前台10S，后台60s
4. ContentProvider执行超时，比较少见

### 发生原因
1. 主线程有耗时操作，如有复杂的layout布局，IO操作等，导致。
2. 被Binder对端block
3. 被子线程同步锁block
4. Binder被占满导致主线程无法和 `System Server` 通信
5. 得不到系统资源（CPU/RAM/IO）


### 从进程的角度
#### 问题出在当前进程:
1. 主线程本身耗时, 或则主线程的消息队列存在耗时操作;
2. 主线程被本进程的其他子线程所blocked;
#### 问题出在远端进程
1. 一般是binder call或socket等通信方式问题























参考[Android 性能优化必知必会](https://www.androidperformance.com/2018/05/07/Android-performance-optimization-skills-and-tools/#/%E7%B3%BB%E7%BB%9F%E6%A1%86%E6%9E%B6)
参考[应用与系统稳定性第一篇---ANR问题分析的一般套路](https://www.jianshu.com/p/18f16aba79dd)
参考[]()
参考[]()
参考[]()
