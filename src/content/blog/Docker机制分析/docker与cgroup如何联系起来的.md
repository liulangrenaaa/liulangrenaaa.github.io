---
title: docker与cgroup如何联系起来的
date: 2020-12-12 19:00:00
tags:
    - docker
    - cgroup
categories:
    - docker
slug: "Docker机制分析/docker与cgroup如何联系起来的"
---



一直说Docker 是基于linux三大技术 Cgroups, Namespace, OverlayFs 技术。
Cgroups, Namespace 着重的是 docker 的运行时，OverlayFs 着重的是 docker Image.
但是Docker 与 Cgroups, Namespace, OverlayFs 是怎么联系起来的呢，却很少有人说的明白，
我是一个好奇心很重的人，我会用几篇文章来记录分析一下他们怎么练习起来的。

这篇文章主要实操看一看 Docker 与 Cgroup 的联系。

1. 首先去 /sys/fs/cgroup/ 目录看一下当前支持的子系统controller，各个子系统controller下面一般情况下都是空的，表明系统中没有额外的cgroup，基本都只有root_cgroup.
虽然4.5版本之后 cgroup v2 就进入mainline了，但是 现在（2020.12.01）docker 基本还是在使用 cgroup v1, 应该也算是一个历史原因了吧，不知道何时 docker能迁移到 cgroup v2 上，期待ing
```
tencent_clould@ubuntu: /sys/fs/cgroup# ls
blkio  cpuacct      cpuset   freezer  memory   net_cls,net_prio  perf_event  rdma     unified
cpu    cpu,cpuacct  devices  hugetlb  net_cls  net_prio          pids        systemd
tencent_clould@ubuntu: /sys/fs/cgroup# mount | grep cgroup
tmpfs on /sys/fs/cgroup type tmpfs (ro,nosuid,nodev,noexec,mode=755)
cgroup2 on /sys/fs/cgroup/unified type cgroup2 (rw,nosuid,nodev,noexec,relatime)
cgroup on /sys/fs/cgroup/systemd type cgroup (rw,nosuid,nodev,noexec,relatime,xattr,name=systemd)
cgroup on /sys/fs/cgroup/cpuset type cgroup (rw,nosuid,nodev,noexec,relatime,cpuset,clone_children)
cgroup on /sys/fs/cgroup/rdma type cgroup (rw,nosuid,nodev,noexec,relatime,rdma)
cgroup on /sys/fs/cgroup/hugetlb type cgroup (rw,nosuid,nodev,noexec,relatime,hugetlb)
cgroup on /sys/fs/cgroup/memory type cgroup (rw,nosuid,nodev,noexec,relatime,memory)
cgroup on /sys/fs/cgroup/net_cls,net_prio type cgroup (rw,nosuid,nodev,noexec,relatime,net_cls,net_prio)
cgroup on /sys/fs/cgroup/perf_event type cgroup (rw,nosuid,nodev,noexec,relatime,perf_event)
cgroup on /sys/fs/cgroup/devices type cgroup (rw,nosuid,nodev,noexec,relatime,devices)
cgroup on /sys/fs/cgroup/cpu,cpuacct type cgroup (rw,nosuid,nodev,noexec,relatime,cpu,cpuacct)
cgroup on /sys/fs/cgroup/pids type cgroup (rw,nosuid,nodev,noexec,relatime,pids)
cgroup on /sys/fs/cgroup/blkio type cgroup (rw,nosuid,nodev,noexec,relatime,blkio)
freezer on /sys/fs/cgroup/freezer type cgroup (rw,relatime,freezer)
tencent_clould@ubuntu: /sys/fs/cgroup# ls memory
cgroup.clone_children  memory.kmem.failcnt                 memory.limit_in_bytes            memory.usage_in_bytes
cgroup.event_control   memory.kmem.limit_in_bytes          memory.max_usage_in_bytes        memory.use_hierarchy
cgroup.procs           memory.kmem.max_usage_in_bytes      memory.move_charge_at_immigrate  notify_on_release
cgroup.sane_behavior   memory.kmem.slabinfo                memory.numa_stat                 release_agent
docker                 memory.kmem.tcp.failcnt             memory.oom_control               system.slice
init.scope             memory.kmem.tcp.limit_in_bytes      memory.pressure_level            tasks
machine.slice          memory.kmem.tcp.max_usage_in_bytes  memory.soft_limit_in_bytes       user
memory.failcnt         memory.kmem.tcp.usage_in_bytes      memory.stat                      user.slice
memory.force_empty     memory.kmem.usage_in_bytes          memory.swappiness
tencent_clould@ubuntu: /sys/fs/cgroup# cat memory/tasks
2
3
4
....
1728692
1731590
```

2. 基于 ubuntu image新建一个docker，限制memory 为 4MB
```
tencent_clould@ubuntu: /sys/fs/cgroup# sudo docker run -t -i -m 4MB ubuntu /bin/bash
WARNING: Your kernel does not support swap limit capabilities or the cgroup is not mounted. Memory limited without swap.
root@b3c618bb4df9:/#
```
警告可以忽略，可以看到docker的 id是 b3c618bb4df9。

3. 可以发现各个子系统目录都会新建一个docker目录，且docker目录下有一个目录就是上面的docker container 的id。
```
tencent_clould@ubuntu: /sys/fs/cgroup/memory# ls
cgroup.clone_children           memory.kmem.slabinfo                memory.soft_limit_in_bytes
cgroup.event_control            memory.kmem.tcp.failcnt             memory.stat
cgroup.procs                    memory.kmem.tcp.limit_in_bytes      memory.swappiness
cgroup.sane_behavior            memory.kmem.tcp.max_usage_in_bytes  memory.usage_in_bytes
docker                          memory.kmem.tcp.usage_in_bytes      memory.use_hierarchy
init.scope                      memory.kmem.usage_in_bytes          notify_on_release
machine.slice                   memory.limit_in_bytes               release_agent
memory.failcnt                  memory.max_usage_in_bytes           system.slice
memory.force_empty              memory.move_charge_at_immigrate     tasks
memory.kmem.failcnt             memory.numa_stat                    user
memory.kmem.limit_in_bytes      memory.oom_control                  user.slice
memory.kmem.max_usage_in_bytes  memory.pressure_level
tencent_clould@ubuntu: /sys/fs/cgroup/memory# ls docker
1f3a24f9105950f6f463da0effa2465a518039c3bec76de71c6e20626dcfb286  memory.kmem.usage_in_bytes
b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df  memory.limit_in_bytes
cgroup.clone_children                                             memory.max_usage_in_bytes
cgroup.event_control                                              memory.move_charge_at_immigrate
cgroup.procs                                                      memory.numa_stat
memory.failcnt                                                    memory.oom_control
memory.force_empty                                                memory.pressure_level
memory.kmem.failcnt                                               memory.soft_limit_in_bytes
memory.kmem.limit_in_bytes                                        memory.stat
memory.kmem.max_usage_in_bytes                                    memory.swappiness
memory.kmem.slabinfo                                              memory.usage_in_bytes
memory.kmem.tcp.failcnt                                           memory.use_hierarchy
memory.kmem.tcp.limit_in_bytes                                    notify_on_release
memory.kmem.tcp.max_usage_in_bytes                                tasks
memory.kmem.tcp.usage_in_bytes
```

4. 其中 docker 目录下除了 container id的目录其他目录都是无效的，docker这个目录只是限制所有container id的一个顶层目录而已。通过 docker/tasks 为空就可以看出来。
可以看到 `memory/docker/b3c618bb4df9/` 目录下的最大内存限制，就是创建这个容器时设置的最大内存使用示4MB的限制。
```
tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker# cat tasks
tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker#
tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# cat memory.limit_in_bytes
4194304
tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# cat tasks
1733194
tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# ps -aux | grep 17
33194
root     1733194  0.0  0.1   4108  3296 pts/0    Ss+  19:03   0:00 /bin/bash
ubuntu   1737657  0.0  0.0   6432   736 pts/0    S+   19:11   0:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox tencent_clould@ubuntu: /sys/fs/cgroup/memory/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# ps -aux | grep 17
33194
root     1733194  0.0  0.1   4108  3296 pts/0    Ss+  19:03   0:00 /bin/bash
ubuntu   1737657  0.0  0.0   6432   736 pts/0    S+   19:11   0:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox 1733194
```
可以看到这个 `1733194` 进程就是启动 容器时的 /bin/bash 进程

5. 由于其他的 cgroup子系统我们没有对刚刚启动的 container 进行限制，所以也理论上从 cgroup上看到的也是没有限制的，可以看看 cpu controller.
```
tencent_clould@ubuntu: /sys/fs/cgroup/cpu/docker# cat tasks
tencent_clould@ubuntu: /sys/fs/cgroup/cpu/docker# cd -
/sys/fs/cgroup/cpu/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df
tencent_clould@ubuntu: /sys/fs/cgroup/cpu/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# cat tasks
1733194
tencent_clould@ubuntu: /sys/fs/cgroup/cpu/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# cat cpu.cfs_period_us
100000
tencent_clould@ubuntu: /sys/fs/cgroup/cpu/docker/b3c618bb4df96362b371860f84e5de5248339c9675e4eac7fd7fee6ebb5602df# cat cpu.cfs_quota_us
-1
```

这里就不具体介绍 各个子系统目录下文件含义了。
