---
title: last_kmsg
date: 2022-06-18 19:00:00
tags:
    - last_kmsg
    - pstore
categories:
    - 开发工具
slug: "开发工具/last_kmsg"
---



## 简介
一般在成熟的产品平台上都会有 last_kmsg 的这样一个 文件，在kernel 发生重启的时候，可以查看 last_kmsg 文件来确定到底遇到了什么样的问题（panic or reboot等）。
很早的 linux 版本上 last_kmsg 文件给取消了(15d76446205710ddfcba6cc9156c7883074f84b1)

取代的 last_kmsg 的是 pstore_ram

## pstore 配置
在menuconfig中选择内核pstore模块
```
$ make menuconfig
  |-> File systems
    |-> Miscellaneous filesystems
      |-> Persistent store support
        |-> Log kernel console messages    # console 前端
        |-> Log user space messages      # pmsg 前端
        |-> Persistent function tracer      # ftrace 前端
        |-> Log panic/oops to a RAM buffer     # pstore/ram 后端
        |-> Log panic/oops to a block device   # pstore/blk 后端
```


## 使用
挂载
```
mount -t pstore pstore /sys/fs/pstore
```

可以直接cat pstore 目录下文件，就能看到
```
raven:/sys/fs/pstore # cat console-ramoops-0 | head                                                                                                                                                                                                                                                            [    0.000000][    T0] Booting Linux on physical CPU 0x0000000000 [0x412fd050]                                                                                                                                                                                                                                 [    0.000000][    T0] Linux version 5.10.43-android12-9-g47179ad4db2c (build-user@build-host) (Android (7284624, based on r416183b) clang version 12.0.5 (https://android.googlesource.com/toolchain/llvm-project c935d99d7cf2016289302412d708641d52d2f7ee), LLD 12.0.5 (/buildbot/src/android/llvm-toolchain/out/llvm-project/lld c935d99d7cf2016289302412d708641d52d2f7ee)) #1 SMP PREEMPT Tue Jun 14 03:40:05 UTC 2022                                                                                                                                                                                                    [    0.000000][    T0] Machine model: Raven DVT                                                                                                                                                                                                                                                                [    0.000000][    T0] Stack Depot is disabled                                                                                                                                                                                                                                                                 [    0.000000][    T0] Malformed early option 'kvm-arm.mode'                                                                                                                                                                                                                                                   [    0.000000][    T0] efi: UEFI not found.                                                                                                                                                                                                                                                                    [    0.000000][    T0] Reserved memory: created CMA memory pool at 0x00000009f0000000, size 256 MiB                                                                                                                                                                                                            [    0.000000][    T0] OF: reserved mem: initialized node farawimg, compatible id shared-dma-pool                                                                                                                                                                                                              [    0.000000][    T0] Reserved memory: created CMA memory pool at 0x00000009ec400000, size 60 MiB                                                                                                                                                                                                             [    0.000000][    T0] OF: reserved mem: initialized node faimg, compatible id shared-dma-pool                                                                                                                                                                                                                 raven:/sys/fs/pstore #
```