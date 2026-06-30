---
title: cgroup v2 使用
date: 2021-07-06 19:00:00
tags:
    - cgroup v2
categories:
    - cgroup v2
slug: "Docker机制分析/cgroup-v2-使用"
---


## 如何加入 cgroup
`cgroup.procs`
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp# sleep 10000 &
[2] 9087
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp# echo 9087 > cgroup.procs
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp# cat cgroup.procs
7412
9087
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp#
```

### code



## 新建一个 cgroup

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp# mkdir 123
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/tmp# ls
123                     cgroup.type            io.stat              memory.stat
```

### code








## pid cgroup










## freeze cgroup

### demo
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# cat cgroup.freeze
0
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# echo 1 > cgroup.freeze
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope#
```
在这个session 中的所有 task都不执行了，相对于被冻住了。

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.3 167756 11436 ?        Ss   10:32   0:01 /sbin/init
root           2  0.0  0.0      0     0 ?        S    10:32   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   10:32   0:00 [rcu_gp]
root        3342  0.0  0.0   3864  1044 pts/2    S+   10:33   0:00 stress -c 3
root        3343 77.4  0.0   3864   100 pts/2    S+   10:33  26:01 stress -c 3
root        3344 77.2  0.0   3864   100 pts/2    S+   10:33  25:56 stress -c 3
root        3345 77.2  0.0   3864   100 pts/2    S+   10:33  25:56 stress -c 3
```
`ps -aux` 看到 stress thread 都是 处于 sleep状态。

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# echo 0 > cgroup.freeze
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope#
```
解除 freeze之后，再通过 `ps -aux` 查看

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.3 167756 11436 ?        Ss   10:32   0:01 /sbin/init
root           2  0.0  0.0      0     0 ?        S    10:32   0:00 [kthreadd]
root           3  0.0  0.0      0     0 ?        I<   10:32   0:00 [rcu_gp]
root        3343 72.7  0.0   3864   100 pts/2    R+   10:33  26:11 stress -c 3
root        3344 72.4  0.0   3864   100 pts/2    R+   10:33  26:05 stress -c 3
root        3345 72.5  0.0   3864   100 pts/2    R+   10:33  26:06 stress -c 3
```
stress 基本一直处于 `R+` 状态。







## cpu cgroup
通过 各个层级的`cgroup.controllers` 和 `cat cgroup.subtree_control` 设置，将 `user.slice/user-1000.slice/session-1.scope` 开启 cpu cgroup.

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# ls -a | grep cpu
cpu.max
cpu.max.burst
cpu.pressure
cpu.stat
cpu.weight
cpu.weight.nice
```

### 控制cpu配额
默认值 `max 100000`，标识不显示 cpu使用率
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# cat cpu.max
max 100000
```

设置限制 单核 50%
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# echo 50000 100000 > cpu.max
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope# cat cpu.max
50000 100000
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/fs/cgroup/user.slice/user-1000.slice/session-1.scope#
```

四核心 机器上 top 看到
```
top - 11:01:26 up 28 min,  3 users,  load average: 0.27, 1.84, 2.08                                                                               [1/11]
Tasks: 191 total,   4 running, 187 sleeping,   0 stopped,   0 zombie
%Cpu(s): 12.9 us,  0.2 sy,  0.0 ni, 86.9 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3671.7 total,   2367.6 free,    644.6 used,    659.5 buff/cache
MiB Swap:   1497.1 total,   1497.1 free,      0.0 used.   2972.4 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   3343 root      20   0    3864    100      0 R  17.4   0.0  25:21.85 stress
   3345 root      20   0    3864    100      0 R  16.5   0.0  25:18.51 stress
   3344 root      20   0    3864    100      0 R  15.8   0.0  25:19.38 stress
    163 root      20   0       0      0      0 I   0.3   0.0   0:00.34 kworker/2:3-events
```


### 控制cpu权重

后续补充。。