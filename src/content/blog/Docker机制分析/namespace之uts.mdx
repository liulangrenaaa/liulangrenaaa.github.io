---
title: namespace之uts
date: 2021-07-06 19:00:00
tags:
    - namespace
    - uts namespace
categories:
    - namespace
    - uts namespace
slug: "Docker机制分析/namespace之uts"
---



## demo1

shell1:
```
stable_kernel@1kernel: /var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
stable_kernel@kernel: /var/crash# sudo unshare -p -f /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
```

shell2:
```
stable_kernel@kernel: /var/crash# sudo unshare -p -f /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname hhh
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
hhh
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```

shell1:
```
stable_kernel@1kernel: /var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
stable_kernel@kernel: /var/crash# sudo unshare -p -f /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
hhh
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```

可以看出在没有新建uts namespace的时候， 他们都是同一个 uts name；
只要修改任何一个 uts 中的 hostname 的话，所有的都会被修改



## demo2

shell1:
```
stable_kernel@kernel: /var/crash# sudo unshare -p -f -u /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname shell1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
shell1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```

shell2:
```
stable_kernel@kernel: /var/crash# sudo unshare -p -f -u /bin/bash
xhost:  unable to open display ""
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname shell2
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
shell2
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```

shell3:
```
stable_kernel@kernel: /var/crash# hostname
rlk-Standard-PC-i440FX-PIIX-1996
stable_kernel@kernel: /var/crash#
```

可以看出，只要新建了 uts namespace 之后，在 new uts namespace中做任何对 hostname 的修改，都不会影响到 其他 old uts namespace 的 hostname.

## demo3
shell1:
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# hostname
shell1
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# sleep 10000 &
[1] 18
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash#
```

shell2:
```
stable_kernel@kernel: /var/crash# ps -aux | grep sleep
root        3860  0.0  0.0  16716   528 pts/0    S    17:02   0:00 sleep 10000
rlk         3862  0.0  0.0  17676   728 pts/1    S+   17:02   0:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox sleep
stable_kernel@1kernel: /var/crash# sudo nsenter -u -t3860
xhost:  unable to open display ""
root@shell1:/var/crash# hostname
shell1
root@shell1:/var/crash#
```

## uts_namespace 实现
```
copy_processes->copy_namespaces->create_new_namespaces->copy_utsname

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
|     copy_utsname      |
|                       |
+----------+------------+
```



`clone_uts_ns`
```
static struct uts_namespace *clone_uts_ns(struct user_namespace *user_ns,
					  struct uts_namespace *old_ns)
{
	struct uts_namespace *ns;
	struct ucounts *ucounts;
	int err;

	err = -ENOSPC;
	ucounts = inc_uts_namespaces(user_ns);
	if (!ucounts)
		goto fail;

	err = -ENOMEM;
	ns = create_uts_ns();
	if (!ns)
		goto fail_dec;

	err = ns_alloc_inum(&ns->ns);
	if (err)
		goto fail_free;

	ns->ucounts = ucounts;
	ns->ns.ops = &utsns_operations;

	down_read(&uts_sem);
	memcpy(&ns->name, &old_ns->name, sizeof(ns->name)); 	// name 是 struct new_utsname 类型，不是 string
	ns->user_ns = get_user_ns(user_ns);
	up_read(&uts_sem);
	return ns;
}

struct uts_namespace *copy_utsname(unsigned long flags,
	struct user_namespace *user_ns, struct uts_namespace *old_ns)
{
	struct uts_namespace *new_ns;

	BUG_ON(!old_ns);
	get_uts_ns(old_ns);

	if (!(flags & CLONE_NEWUTS))
		return old_ns;

	new_ns = clone_uts_ns(user_ns, old_ns);  // 完全 clone parent 的 uts_namespace

	put_uts_ns(old_ns);
	return new_ns;
}
```

### set
看一下 strace:
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# strace hostname shell0
execve("/usr/bin/hostname", ["hostname", "shell0"], 0x7ffd8feacde8 /* 27 vars */) = 0
sethostname("shell0", 6)                = 0
```

linux 是通过 sethostname syscall 来修改 hostname(保存在 nodename 中)的。
`sethostname`
```
static struct ctl_table uts_kern_table[] = {
	{
		.procname	= "hostname",
		.data		= init_uts_ns.name.nodename,
		.maxlen		= sizeof(init_uts_ns.name.nodename),
		.mode		= 0644,
		.proc_handler	= proc_do_uts_string,
		.poll		= &hostname_poll,
	},
......
};

SYSCALL_DEFINE2(sethostname, char __user *, name, int, len)
{
	int errno;
	char tmp[__NEW_UTS_LEN];

	if (!ns_capable(current->nsproxy->uts_ns->user_ns, CAP_SYS_ADMIN))
		return -EPERM;

	if (len < 0 || len > __NEW_UTS_LEN)
		return -EINVAL;
	errno = -EFAULT;
	if (!copy_from_user(tmp, name, len)) {
		struct new_utsname *u;

		down_write(&uts_sem);
		u = utsname();
		memcpy(u->nodename, tmp, len);
		memset(u->nodename + len, 0, sizeof(u->nodename) - len);
		errno = 0;
		uts_proc_notify(UTS_PROC_HOSTNAME);
		up_write(&uts_sem);
	}
	return errno;
}
```

### get
看一下 strace:
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/var/crash# strace hostname
execve("/usr/bin/hostname", ["hostname"], 0x7ffe740a5980 /* 27 vars */) = 0
uname({sysname="Linux", nodename="shell2", ...}) = 0
```

linux 是通过 uname syscall 来获取 uts 相关信息的。
```
SYSCALL_DEFINE1(uname, struct old_utsname __user *, name)
{
	struct old_utsname tmp;

	if (!name)
		return -EFAULT;

	down_read(&uts_sem);
	memcpy(&tmp, utsname(), sizeof(tmp));		// 获取 task相关utsname 信息
	up_read(&uts_sem);
	if (copy_to_user(name, &tmp, sizeof(tmp)))	// copy 到 user space
		return -EFAULT;

	if (override_release(name->release, sizeof(name->release)))
		return -EFAULT;
	if (override_architecture(name))
		return -EFAULT;
	return 0;
}
```








参考：
[Linux Namespace : UTS](https://www.cnblogs.com/sparkdev/p/9377072.html)







