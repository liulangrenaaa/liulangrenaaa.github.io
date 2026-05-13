---
title: 文件系统的 xattr 是做什么用的
date: 2021-02-01 19:00:40
tags:
    - filesystem
    - xattr
categories:
    - linux内核
---


## 简介
与 xatter 相关的系统调用有
```
getxattr(2), listxattr(2), removexattr(2), setxattr(2)
```

也可以直接使用 `shell` 去控制
```
chattr(1),lsattr(1), btrfs(5), ext4(5), xfs(5).
```

目前还没找到这个 `xatter` 相关的应用，后续再补充。






