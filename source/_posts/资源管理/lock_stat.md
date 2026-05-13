---
title: lock_stat
date: 2021-01-16 19:00:00
tags:
    - lock_stat
categories:
    - linux内核
---

## 介绍
lock_stat 是一款测试查看内核锁状态的工具，可以看出刚刚锁的争用繁忙情况和到底哪个路径上争用最多，从而找到性能优化的思路。
但是它会使内核的大小变大很多





## 使用
使用之前需要使能`CONFIG_LOCK_STATS`，然后重新编译内核
```
CONFIG_LOCK_STAT:
This feature enables tracking lock contention points
For more details, see Documentation/locking/lockstat.rst
This also enables lock events required by "perf lock",
subcommand of perf.
If you want to use "perf lock", you also need to turn on
CONFIG_EVENT_TRACING.

CONFIG_LOCK_STAT defines "contended" and "acquired" lock events.
(CONFIG_LOCKDEP defines "acquire" and "release" events.)
```


enable/disable
```
# echo 1 >/proc/sys/kernel/lock_stat
# echo 0 >/proc/sys/kernel/lock_stat
```

enable之后，数据在 `/proc/lock_stat`输出
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/proc# head lock_stat
lock_stat version 0.4
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                              class name    con-bounces    contentions   waittime-min   waittime-max waittime-total   waittime-avg    acq-bounces   acquisitions   holdtime-min   holdtime-max holdtime-total   holdtime-avg
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                         &dentry->d_lock:          6614           6650           0.06       23656.56      133605.67          20.09         282765        2391624           0.00       36452.61      529319.05           0.22
                         ---------------
                         &dentry->d_lock           1703          [<0000000060216fb7>] lockref_get_not_dead+0xe/0x30
                         &dentry->d_lock            747          [<00000000bcf55138>] __d_lookup+0x76/0x160
                         &dentry->d_lock           3256          [<000000009f49056e>] dput+0x146/0x380
```



## 格式解析

看一份完整的log
```
lock_stat version 0.4
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                              class name    con-bounces    contentions   waittime-min   waittime-max waittime-total   waittime-avg    acq-bounces   acquisitions   holdtime-min   holdtime-max holdtime-total   holdtime-avg
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                         &dentry->d_lock:          6606           6642           0.06       23656.56      133603.59          20.11         242023        1893479           0.00       36452.61      427674.18           0.23
                         ---------------
                         &dentry->d_lock           1699          [<0000000060216fb7>] lockref_get_not_dead+0xe/0x30
                         &dentry->d_lock            747          [<00000000bcf55138>] __d_lookup+0x76/0x160
                         &dentry->d_lock           3254          [<000000009f49056e>] dput+0x146/0x380
                         &dentry->d_lock            536          [<000000003b543617>] lockref_get+0x9/0x20
                         ---------------
                         &dentry->d_lock           1792          [<0000000060216fb7>] lockref_get_not_dead+0xe/0x30
                         &dentry->d_lock            764          [<00000000bcf55138>] __d_lookup+0x76/0x160
                         &dentry->d_lock           3082          [<000000009f49056e>] dput+0x146/0x380
                         &dentry->d_lock            537          [<000000003b543617>] lockref_get+0x9/0x20

.............................................................................................................................................................................................................................

                      &mm->mmap_lock#2-W:           729           1328           0.12       56312.54      243027.65         183.00           3411         138648           0.10       34454.21     1951568.44          14.08
                      &mm->mmap_lock#2-R:           883           3858           0.13       11168.49      224472.15          58.18           4642         736764           0.08       79362.93     8514224.22          11.56
                      ------------------
                        &mm->mmap_lock#2           3840          [<00000000346dbc30>] do_user_addr_fault+0x403/0x690
                        &mm->mmap_lock#2             73          [<000000007f3a53b5>] mpol_rebind_mm+0x27/0xf0
                        &mm->mmap_lock#2             13          [<0000000004a222ed>] __access_remote_vm+0x4d/0x350
                        &mm->mmap_lock#2            378          [<00000000e3ffe1c7>] vm_mmap_pgoff+0xa9/0x180
                      ------------------
                        &mm->mmap_lock#2             94          [<000000007f3a53b5>] mpol_rebind_mm+0x27/0xf0
                        &mm->mmap_lock#2             73          [<00000000542c73e5>] dup_mm+0xd5/0x640
                        &mm->mmap_lock#2             18          [<0000000015e7bc9a>] dup_mm+0x9c/0x640
                        &mm->mmap_lock#2              1          [<00000000d9e9fd4c>] prctl_set_mm+0xfa/0x540

.............................................................................................................................................................................................................................
```

可以看出争用的路径，尝试获取锁次数，获取但是需要等待的次数，等待的最大、最小、平均时间等，持有锁的最大、最小、平均时间。

```
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                              class name    con-bounces    contentions   waittime-min   waittime-max waittime-total   waittime-avg    acq-bounces   acquisitions   holdtime-min   holdtime-max holdtime-total   holdtime-avg
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                           &sem->waiters:             0              0           0.00           0.00           0.00           0.00             36            618           0.09           1.69         140.32           0.23
                           callback_lock:             0              0           0.00           0.00           0.00           0.00             28            121           0.10           1.83          67.38           0.56
                               pmus_lock:             0              0           0.00           0.00           0.00           0.00             20             30           0.00         200.86         231.73           7.72
                           &rsp->gp_wait:             0              0           0.00           0.00           0.00           0.00             79           1430           0.07           5.83         265.57           0.19
                         &cpuset_rwsem-W:             0              0           0.00           0.00           0.00           0.00              0            618           0.64       76605.59     1370704.10        2217.97
                         &cpuset_rwsem-R:             0              0           0.00           0.00           0.00           0.00              0            413           0.00          21.72         473.62           1.15
         "warn_unseeded_randomness".lock:             0              0           0.00           0.00           0.00           0.00              0              1           0.08           0.08           0.08           0.08
                                &c->lock:             0              0           0.00           0.00           0.00           0.00              0         201310           0.00         457.69       38407.85           0.19
                         cgroup_idr_lock:             0              0           0.00           0.00           0.00           0.00             88           2148           0.09          11.15         939.40           0.44
                             pin_fs_lock:             0              0           0.00           0.00           0.00           0.00             35          11335           0.00          15.48        1171.10           0.10
                  tk_core.seq.seqcount-W:             0              0           0.00           0.00           0.00           0.00              0          10049           0.00         894.17       10020.79           1.00
                  tk_core.seq.seqcount-R:             0              0           0.00           0.00           0.00           0.00              0        1126135           0.00        4915.37      105326.06           0.09
                     cgroup_file_kn_lock:             0              0           0.00           0.00           0.00           0.00            197           1734           0.06          28.30        1893.58           1.09
                  cpufreq_governor_mutex:             0              0           0.00           0.00           0.00           0.00              0              6           0.00           0.32           0.95           0.16
               &sb->s_type->i_lock_key#4:             0              0           0.00           0.00           0.00           0.00              2             69           0.05           0.80          16.10           0.23
                         timekeeper_lock:             0              0           0.00           0.00           0.00           0.00           4065          10349           0.00        6268.82       26333.01           2.54
                         resource_lock-W:             0              0           0.00           0.00           0.00           0.00              1            357           0.08           3.13          77.04           0.22
                         resource_lock-R:             0              0           0.00           0.00           0.00           0.00             24           1601           0.08          29.63         682.58           0.43
                 &type->s_umount_key#4/1:             0              0           0.00           0.00           0.00           0.00              0              1           6.78           6.78           6.78           6.78
                            drivers_lock:             0              0           0.00           0.00           0.00           0.00              2              4           0.09           0.44           0.99           0.25
                      pernet_ops_rwsem-W:             0              0           0.00           0.00           0.00           0.00              2            115           0.00         367.87        2408.12          20.94
                      pernet_ops_rwsem-R:             0              0           0.00           0.00           0.00           0.00              5              5        1129.92       83930.70       94433.84       18886.77
                      proc_subdir_lock-W:             0              0           0.00           0.00           0.00           0.00              4            586           0.00          29.05         195.94           0.33
                      proc_subdir_lock-R:             0              0           0.00           0.00           0.00           0.00            129            963           0.00          13.59         394.16           0.41
                          subsys mutex#2:             0              0           0.00           0.00           0.00           0.00              0              1           0.12           0.12           0.12           0.12
```
这里可以看出系统中最繁忙的锁的数据统计信息



参考[使用 ftrace](https://source.android.google.cn/devices/tech/debug/ftrace?hl=zh-cn)
参考[Lock Statistics](https://www.kernel.org/doc/html/latest/locking/lockstat.html)

