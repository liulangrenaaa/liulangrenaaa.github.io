---
title: cgroup v1 v2
date: 2021-07-06 19:00:00
tags:
    - cgroup v1
    - cgroup v2
categories:
    - cgroup v1
    - cgroup v2
---

1. cgroup v1 与 v2 可以同时并存吗？

cgroup v1 v2 在编译时，是同时被编译进 kernel Image的
```
ubuntu@zeku_server:~/workspace/linux $ cat kernel/cgroup/Makefile
# SPDX-License-Identifier: GPL-2.0
obj-y := cgroup.o rstat.o namespace.o cgroup-v1.o freezer.o
```


2. ubuntu 如何区分当前正在使用的是 cgroup v1 还是 v2
cgroup v1:
```
tencent_clould@ubuntu: ~/workspace# mount | grep cgroup
tmpfs on /sys/fs/cgroup type tmpfs (ro,nosuid,nodev,noexec,mode=755)
cgroup2 on /sys/fs/cgroup/unified type cgroup2 (rw,nosuid,nodev,noexec,relatime)
cgroup on /sys/fs/cgroup/systemd type cgroup (rw,nosuid,nodev,noexec,relatime,xattr,name=systemd)
cgroup on /sys/fs/cgroup/cpu,cpuacct type cgroup (rw,nosuid,nodev,noexec,relatime,cpu,cpuacct)
cgroup on /sys/fs/cgroup/devices type cgroup (rw,nosuid,nodev,noexec,relatime,devices)
cgroup on /sys/fs/cgroup/cpuset type cgroup (rw,nosuid,nodev,noexec,relatime,cpuset,clone_children)
cgroup on /sys/fs/cgroup/blkio type cgroup (rw,nosuid,nodev,noexec,relatime,blkio)
cgroup on /sys/fs/cgroup/memory type cgroup (rw,nosuid,nodev,noexec,relatime,memory)
cgroup on /sys/fs/cgroup/perf_event type cgroup (rw,nosuid,nodev,noexec,relatime,perf_event)
cgroup on /sys/fs/cgroup/hugetlb type cgroup (rw,nosuid,nodev,noexec,relatime,hugetlb)
cgroup on /sys/fs/cgroup/net_cls,net_prio type cgroup (rw,nosuid,nodev,noexec,relatime,net_cls,net_prio)
cgroup on /sys/fs/cgroup/freezer type cgroup (rw,nosuid,nodev,noexec,relatime,freezer)
cgroup on /sys/fs/cgroup/rdma type cgroup (rw,nosuid,nodev,noexec,relatime,rdma)
cgroup on /sys/fs/cgroup/pids type cgroup (rw,nosuid,nodev,noexec,relatime,pids)
```


cgroup v2:
```
ubuntu@zeku_server:~/workspace/linux $ mount | grep cgroup
cgroup2 on /sys/fs/cgroup type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate)
ubuntu@zeku_server:~/workspace/linux $
```

3. 如何是的默认开启 cgroup v2
a. 修改 command line
```
ubuntu@zeku_server:~/workspace/linux $ cat /etc/default/grub | grep LINE
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=1"
```

b. 修改 command line, 来disable 所有 cgroup v1 的 feature
```
cgroup_no_v1=all
```
对应 `kernel/cgroup/cgroup-v1.c` 中 `cgroup_no_v1`
```
static int __init cgroup_no_v1(char *str);
```

c. 可以在 其他挂载点，重新挂载 cgroup2
```
mount -t cgroup2 none /sys/fs/cgroup
```

4. cgroup v1、v2 中task 是如何加入 cgroup的？
cgroup v1:
```
tencent_clould@ubuntu: ~/workspace# cat  /proc/$$/cgroup
12:pids:/user.slice/user-1000.slice/session-99270.scope
11:rdma:/
10:freezer:/user/ubuntu/0
9:net_cls,net_prio:/
8:hugetlb:/
7:perf_event:/
6:memory:/user.slice/user-1000.slice/session-99270.scope
5:blkio:/user.slice
4:cpuset:/
3:devices:/user.slice
2:cpu,cpuacct:/user.slice
1:name=systemd:/user.slice/user-1000.slice/session-99270.scope
0::/user.slice/user-1000.slice/session-99270.scope
tencent_clould@ubuntu: ~/workspace#
```

cgroup v1:
```
ubuntu@zeku_server:~/workspace/linux $ cat /proc/$$/cgroup
0::/user.slice/user-1000.slice/session-166.scope
ubuntu@zeku_server:~/workspace/linux $
```

可以看到 cgroup v1中，一个 task会存在多个 子系统的目录下，即使这个子系统没有起作用（在子系统根目录）；在 cgroup v2 中，一个 task 只会存在一个 目录下，简洁（一个目录根据 cgoups.controller 来使能相关的 子系统）

5. a


6. aa











