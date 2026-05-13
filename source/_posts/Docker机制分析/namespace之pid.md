---
title: namespace之pid
date: 2021-07-06 19:00:00
tags:
    - namespace
    - pid namespace
categories:
    - namespace
    - pid namespace
---


## demo1
shell 1:
```
stable_kernel@kernel: /var/crash# echo $$
4371
stable_kernel@kernel: /var/crash# readlink /proc/$$/ns/pid
pid:[4026531836]
stable_kernel@kernel: /var/crash#
stable_kernel@kernel: /var/crash# sudo unshare --pid --mount-proc --fork /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# readlink /proc/$$/ns/pid
pid:[4026532210]
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# ps
    PID TTY          TIME CMD
      1 pts/3    00:00:00 bash
     10 pts/3    00:00:00 ps
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# stress -c 10
stress: info: [11] dispatching hogs: 10 cpu, 0 io, 0 vm, 0 hdd
^Z
[1]+  Stopped                 stress -c 10
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1  18476  4136 pts/3    S    12:10   0:00 /bin/bash
root          11  0.0  0.0   3864   984 pts/3    T    12:12   0:00 stress -c 10
root          12 36.8  0.0   3864   100 pts/3    T    12:12   1:21 stress -c 10
root          13 39.4  0.0   3864   100 pts/3    T    12:12   1:27 stress -c 10
root          14 40.0  0.0   3864   100 pts/3    T    12:12   1:28 stress -c 10
root          15 38.8  0.0   3864   100 pts/3    T    12:12   1:25 stress -c 10
root          16 39.3  0.0   3864   100 pts/3    T    12:12   1:26 stress -c 10
root          17 38.8  0.0   3864   100 pts/3    T    12:12   1:25 stress -c 10
root          18 40.3  0.0   3864   100 pts/3    T    12:12   1:29 stress -c 10
root          19 39.4  0.0   3864   100 pts/3    T    12:12   1:27 stress -c 10
root          20 40.4  0.0   3864   100 pts/3    T    12:12   1:29 stress -c 10
root          21 38.3  0.0   3864   100 pts/3    T    12:12   1:24 stress -c 10
root          22  0.0  0.0  20312  3608 pts/3    R+   12:16   0:00 ps -aux
```


shell 2
```
root        4501  0.0  0.0   3864   984 pts/3    S+   12:12   0:00 stress -c 10
root        4502 37.2  0.0   3864   100 pts/3    R+   12:12   1:18 stress -c 10
root        4503 40.1  0.0   3864   100 pts/3    R+   12:12   1:24 stress -c 10
root        4504 40.9  0.0   3864   100 pts/3    R+   12:12   1:26 stress -c 10
root        4505 39.4  0.0   3864   100 pts/3    R+   12:12   1:22 stress -c 10
root        4506 39.9  0.0   3864   100 pts/3    R+   12:12   1:23 stress -c 10
root        4507 39.4  0.0   3864   100 pts/3    R+   12:12   1:22 stress -c 10
root        4508 41.0  0.0   3864   100 pts/3    R+   12:12   1:26 stress -c 10
root        4509 40.2  0.0   3864   100 pts/3    R+   12:12   1:24 stress -c 10                       "rlk-Standard-PC-i440F" 12:18 07-7月-21
root        4510 41.0  0.0   3864   100 pts/3    R+   12:12   1:26 stress -c 10
root        4511 39.1  0.0   3864   100 pts/3    R+   12:12   1:22 stress -c 10
rlk         4522  0.0  0.0  20312  3744 pts/2    R+   12:15   0:00 ps -aux
```


debug log
```
[ 2276.675896] [robert] alloc_pid level = 1, pid->numbers[i].nr = 11
[ 2276.679264] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4501
[ 2276.694094] [robert] alloc_pid level = 1, pid->numbers[i].nr = 12
[ 2276.697715] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4502
[ 2276.700705] [robert] alloc_pid level = 1, pid->numbers[i].nr = 13
[ 2276.703495] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4503
[ 2276.706523] [robert] alloc_pid level = 1, pid->numbers[i].nr = 14
[ 2276.709158] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4504
[ 2276.712157] [robert] alloc_pid level = 1, pid->numbers[i].nr = 15
[ 2276.714937] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4505
[ 2276.717940] [robert] alloc_pid level = 1, pid->numbers[i].nr = 16
[ 2276.720724] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4506
[ 2276.723808] [robert] alloc_pid level = 1, pid->numbers[i].nr = 17
[ 2276.726108] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4507
[ 2276.728367] [robert] alloc_pid level = 1, pid->numbers[i].nr = 18
[ 2276.730191] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4508
[ 2276.732382] [robert] alloc_pid level = 1, pid->numbers[i].nr = 19
[ 2276.734118] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4509
[ 2276.736167] [robert] alloc_pid level = 1, pid->numbers[i].nr = 20
[ 2276.737602] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4510
[ 2276.739537] [robert] alloc_pid level = 1, pid->numbers[i].nr = 21
[ 2276.740830] [robert] alloc_pid level = 1, pid->numbers[i].nr = 4511
[ 2279.849411] [robert] alloc_pid level = 0, pid->numbers[i].nr = 4512
```
可以看到， new pid_namespace 中的 21 对应 old pid_namespace 中的 4511...

添加 log的 patch是：
```
ubuntu@zeku_server:~/workspace/linux $ git diff
diff --git a/kernel/pid.c b/kernel/pid.c
index ebdf9c60cd0b..eb80bac14e13 100644
--- a/kernel/pid.c
+++ b/kernel/pid.c
@@ -186,7 +186,6 @@ struct pid *alloc_pid(struct pid_namespace *ns, pid_t *set_tid,

        for (i = ns->level; i >= 0; i--) {
                int tid = 0;
-
                if (set_tid_size) {
                        tid = set_tid[ns->level - i];

@@ -243,6 +242,9 @@ struct pid *alloc_pid(struct pid_namespace *ns, pid_t *set_tid,

                pid->numbers[i].nr = nr;
                pid->numbers[i].ns = tmp;
+               pr_err("[robert] alloc_pid level = %d, pid->numbers[i].nr = %d\n",
+                       pid->level, nr);
+
                tmp = tmp->parent;
        }

diff --git a/kernel/pid_namespace.c b/kernel/pid_namespace.c
index ca43239a255a..72ad5a3ddf29 100644
--- a/kernel/pid_namespace.c
+++ b/kernel/pid_namespace.c
@@ -46,6 +46,7 @@ static struct kmem_cache *create_pid_cachep(unsigned int level)
        if (kc)
                return kc;

+       pr_err("[robert] create_pid_cachep level = %d\n", level);
        snprintf(name, sizeof(name), "pid_%u", level + 1);
        len = sizeof(struct pid) + level * sizeof(struct upid);
        mutex_lock(&pid_caches_mutex);
ubuntu@zeku_server:~/workspace/linux $
```

## demo2

shell1:
```
rlk@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash$ echo $$
4724
rlk@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash$ sudo unshare --pid --mount-proc --fork /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# echo $$
1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# sudo unshare --pid --mount-proc --fork /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# echo $$
1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# sudo unshare --pid --mount-proc --fork /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# echo $$
1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# sudo unshare --pid --mount-proc --fork /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# stress -c 10
stress: info: [9] dispatching hogs: 10 cpu, 0 io, 0 vm, 0 hdd
```


shell2:
```
stable_kernel@kernel: /var/crash# pstree -p 4724
bash(4724)───sudo(4734)───unshare(4735)───bash(4736)───sudo(4744)───unshare(4746)───bash(4747)───sudo(4759)───unshare(4760)───bash(4761)───sudo(4770)──+++
stable_kernel@kernel: /var/crash# grep pid /proc/4761/status
NSpid:	4761	21	11	1
stable_kernel@kernel: /var/crash#
```

第四个 bash 在 四个 pid namespace 中 分配 到的 pid 分别是
`4761` `21`  `11` `1`



## pid_namespace 实现

### create
```
copy_processes->copy_namespaces->create_new_namespaces->copy_pid_ns->create_pid_namespace

 +----------------------+
 |                      |
 |                      |
 |    copy_processes    |
 |                      |
 +----------+-----------+
            |
            |
+-----------v------------+
|                        |
|                        |
|    copy_namespaces     |
|                        |
+----------+-------------+
           |
           |
           |
+----------v--------------+
|                         |
|                         |
|  create_new_namespaces  |
|                         |
+----------+--------------+
           |
           |
           |
+----------v------------+
|                       |
|                       |
|     copy_pid_ns       |
|                       |
+----------+------------+
           |
           |
  +--------v------------+
  |                     |
  |                     |
  | create_pid_namespace|
  |                     |
  +---------------------+
```

`create_pid_namespace`
```
static struct pid_namespace *create_pid_namespace(struct user_namespace *user_ns,
	struct pid_namespace *parent_pid_ns)
{
	struct pid_namespace *ns;
	unsigned int level = parent_pid_ns->level + 1; // level 在 parent的基础上 +1
	struct ucounts *ucounts;
	int err;

	err = -ENOMEM;
	ns = kmem_cache_zalloc(pid_ns_cachep, GFP_KERNEL);
	if (ns == NULL)
		goto out_dec;

	idr_init(&ns->idr);

	ns->pid_cachep = create_pid_cachep(level);  // 创建 cachep, 是根据 level 创建的。最大level 是 32
	if (ns->pid_cachep == NULL)
		goto out_free_idr;

	err = ns_alloc_inum(&ns->ns);
	if (err)
		goto out_free_idr;
	ns->ns.ops = &pidns_operations;

	refcount_set(&ns->ns.count, 1);
	ns->level = level;                      // 设置 level
	ns->parent = get_pid_ns(parent_pid_ns); // 设置 parent
	ns->user_ns = get_user_ns(user_ns);
	ns->ucounts = ucounts;
	ns->pid_allocated = PIDNS_ADDING;

	return ns;

out_free_idr:
	idr_destroy(&ns->idr);
	kmem_cache_free(pid_ns_cachep, ns);
out_dec:
	dec_pid_namespaces(ucounts);
out:
	return ERR_PTR(err);
}
```

### alloc

`alloc_pid`


```
struct pid *alloc_pid(struct pid_namespace *ns, pid_t *set_tid,
		      size_t set_tid_size)
{
	struct pid *pid;
	enum pid_type type;
	int i, nr;
	struct pid_namespace *tmp;
	struct upid *upid;
	int retval = -ENOMEM;

	pid = kmem_cache_alloc(ns->pid_cachep, GFP_KERNEL);
	if (!pid)
		return ERR_PTR(retval);

	tmp = ns;
	pid->level = ns->level; // 设置 level

	for (i = ns->level; i >= 0; i--) {              // 循环遍历 各个level，从大到小，pid的值从小到大（debug log中看到）
		int tid = 0;

		idr_preload(GFP_KERNEL);
		spin_lock_irq(&pidmap_lock);

		if (tid) {
			nr = idr_alloc(&tmp->idr, NULL, tid,
				       tid + 1, GFP_ATOMIC); // 从 tmp->idr 中分配
			/*
			 * If ENOSPC is returned it means that the PID is
			 * alreay in use. Return EEXIST in that case.
			 */
			if (nr == -ENOSPC)
				nr = -EEXIST;
		} else {
			int pid_min = 1;
			/*
			 * init really needs pid 1, but after reaching the
			 * maximum wrap back to RESERVED_PIDS
			 */
			if (idr_get_cursor(&tmp->idr) > RESERVED_PIDS)
				pid_min = RESERVED_PIDS;

			/*
			 * Store a null pointer so find_pid_ns does not find
			 * a partially initialized PID (see below).
			 */
			nr = idr_alloc_cyclic(&tmp->idr, NULL, pid_min,
					      pid_max, GFP_ATOMIC);
		}
		spin_unlock_irq(&pidmap_lock);
		idr_preload_end();

		if (nr < 0) {
			retval = (nr == -ENOSPC) ? -EAGAIN : nr;
			goto out_free;
		}

		pid->numbers[i].nr = nr; // pid 结构保存 各个level 的 pid数值，获取pid 的时候需要带上当前在哪一个 level上
		pid->numbers[i].ns = tmp;
		pr_err("[robert] alloc_pid level = %d, pid->numbers[i].nr = %d\n",
			pid->level, nr);

		tmp = tmp->parent; // 获取上层的 pid_namespace
	}

......
}
```


## unshare 、 nsenter 用法
这些都是 shell 提供的和namespace 相关的命令

### unshare
unshare 解除 namespaces share, 创建新的进程，是Linux容器工作的基础之一。
通过 strace 工具看一下
```
stable_kernel@kernel: /var/crash# sudo strace unshare  -p -u -i /bin/bash
execve("/usr/bin/unshare", ["unshare", "-p", "-u", "-i", "/bin/bash"], 0x7ffeeb2594b0 /* 22 vars */) = 0
unshare(CLONE_NEWUTS|CLONE_NEWIPC|CLONE_NEWPID) = 0
execve("/bin/bash", ["/bin/bash"], 0x7ffc50847728 /* 22 vars */) = 0
```
可以看到 unshare(1) 是通过 unshare(2) 实现的
`mount`  `mount-proc` 区别：
+ mount: 创建 mount namespace
+ mount-proc: 自动挂载 /proc 文件系统，无需我们手动执行 mount -t proc proc /proc 命令。

-p -f 一般是一起使用。


### nsenter
一个最典型的用途就是进入容器的网络命令空间。
相当多的容器为了轻量级，是不包含较为基础的命令的，比如说ip address，ping，telnet，ss，tcpdump等等命令，
这就给调试容器网络带来相当大的困扰：只能通过docker inspect ContainerID命令获取到容器IP，
以及无法测试和其他网络的连通性。这时就可以使用nsenter命令仅进入该容器的网络命名空间，
使用宿主机的命令调试容器网络。

此外，nsenter也可以进入mnt, uts, ipc, pid, user命令空间，以及指定根目录和工作目录。
shell1:
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# sleep 100000 &
[2] 23
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# dmesg |tail -n 30
[ 1515.281875] [robert] alloc_pid level = 5, pid->numbers[i].nr = 23
[ 1515.285805] [robert] alloc_pid level = 5, pid->numbers[i].nr = 33
[ 1515.287239] [robert] alloc_pid level = 5, pid->numbers[i].nr = 54
[ 1515.288000] [robert] alloc_pid level = 5, pid->numbers[i].nr = 64
[ 1515.288656] [robert] alloc_pid level = 5, pid->numbers[i].nr = 74
[ 1515.289393] [robert] alloc_pid level = 5, pid->numbers[i].nr = 3791
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```
这是在 一个 独立 namespace 中的 shell，在 global namespace中 pid是 3791

shell2:
```
stable_kernel@kernel: /var/crash# sudo nsenter -p -t3791
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# ls &
[1] 36
```

通过 strace 工具看一下
```
stable_kernel@1kernel: /var/crash# sudo strace nsenter -p  -t4123 ls -al
execve("/usr/bin/nsenter", ["nsenter", "-p", "-t4123", "ls", "-al"], 0x7fff5f859620 /* 22 vars */) = 0
setns(3, CLONE_NEWPID)                  = 0
```

nsenter相当于在setns的示例程序之上做了一层封装，使我们无需指定命名空间的文件描述符，而是指定进程号即可。

## unshare 、 setns 、 clone 用法

后续有空 用 C实现一下 example。。。








参考：
[容器实现-namespace](https://staight.github.io/2019/10/02/%E5%AE%B9%E5%99%A8%E5%AE%9E%E7%8E%B0-namespace/)
[]()
