---
title: kdump+crash定位稳定性问题
date: 2021-01.20 19:00:00
tags:
    - kdump
    - crash
    - makedumpfile
categories:
    - 开发工具
---


## kudmp 原理
kdump实际上有两个内核，一个是正常运行的内核，一个我们称为捕获内核/第二内核。

1. 首先需要通过crashkernel=xxx@xxxx来专门为kdump功能专门预留一部分内存，
用来放置第二个内核和其他数据信息的，这一部分是给捕获内核使用的。
2. 可以通过kexec系统调用，将第二个内核和initrd，vmcore信息，启动参数等传递给第一个内核。
3. 当系统崩溃时，保存当前寄存器信息，检查是否加载了捕获内核，如果存在则跳转到捕获内核，
捕获内核和正常内核一样启动，但是会提供/proc/vmcore接口能够导出内存镜像信息，
可以使用dd工具，高级的makedumpfile提供压缩选项。
4. 系统重启，之后就可以使用crash/gdb分析dump文件了

所以可以配置的就本就是 crashkernel的大小，makedumpfile 工具

## kudmp 安装使用
首先是编译 kernel 配置
```
CONFIG_KEXEC=y
CONFIG_SYSFS=y
CONFIG_DEBUG_INFO=Y
CONFIG_CRASH_DUMP=y
CONFIG_PROC_VMCORE=y
```


安装
```
sudo apt install kdump-tools
sudo apt install crash
```

如何使用？可以直接主动触发一个崩溃来看看效果
```
sudo su
echo c   >  /proc/sysrq-trigger
```

然后就进入转存储过程，一般会转存储到 `/var/crash/$date` 目录下，
此时应该包含 `dump.$date` 文件，但是还需要 `vmlinux` 文件才可以使用 `crash` 工具分析。
`vmlinux` 是 编译生成的带符号表的可执行文件，只要将它copy到当前目录就可以一起分析了。

一般系统这样就可以搞起来了。

## kdump 遇到的问题

但是我这边是一直跟踪 `mainline kernel`, 上述过程都不是很顺利。
遇到的问题：
1. `makefiledump` 转存储不成功
```
[    4.030842] kdump-tools[301]: Starting kdump-tools:
[    4.032464] kdump-tools[308]:  * running makedumpfile -c -d 31 /proc/vmcore /var/crash/202101192137/dump-incomplete
[   24.045632] kdump-tools[380]: check_release: Can't get the kernel version.
[   24.069205] kdump-tools[380]: The kernel version is not supported.
[   24.071343] kdump-tools[380]: The makedumpfile operation may be incomplete.
[   24.077177] kdump-tools[380]: makedumpfile Failed.
[   24.079278] kdump-tools[308]:  * kdump-tools: makedumpfile failed, falling back to 'cp'
```

我们发现是 运行 `makedumpfile` 过程中，由于 无法 `get kernel version` 导致无法压缩转存储
成功。
找到 `makedumpfile` [源码]()

添加log 复现。(重新编译 makedumpfile 花费了不少时间)
```
[    4.030842] kdump-tools[301]: Starting kdump-tools:
[    4.032464] kdump-tools[308]:  * running makedumpfile -c -d 31 /proc/vmcore /var/crash/202101192137/dump-incomplete
[    4.041333] kdump-tools[380]: create_dumpfile: create_dumpfile!
[   24.045632] kdump-tools[380]: check_release: Can't get the kernel version.
[   24.056179] kdump-tools[380]: The kernel version 0:0:0.
[   24.063203] kdump-tools[380]: The kernel version:[0] old_version:[33947663] new_version:[85196807].
[   24.069205] kdump-tools[380]: The kernel version is not supported.
[   24.071343] kdump-tools[380]: The makedumpfile operation may be incomplete.
[   24.077177] kdump-tools[380]: makedumpfile Failed.
[   24.079278] kdump-tools[308]:  * kdump-tools: makedumpfile failed, falling back to 'cp'
```

是这段代码原因
```
#define OLDEST_VERSION		KERNEL_VERSION(2, 6, 15) /* linux-2.6.15 */
#define LATEST_VERSION		KERNEL_VERSION(5, 9, 4) /* linux-5.9.4 */

int32_t get_kernel_version(char *release)
{
	version = KERNEL_VERSION(maj, min, rel);
	if ((version < OLDEST_VERSION) || (LATEST_VERSION < version)) {
		MSG("The kernel version is not supported.\n");
		MSG("The makedumpfile operation may be incomplete.\n");
	}
}

int check_release(void)
{
	info->kernel_version = get_kernel_version(info->system_utsname.release);
	if (info->kernel_version == FALSE) {
		ERRMSG("Can't get the kernel version.\n");
		return FALSE;
	}
}
```

第一步先将 `LATEST_VERSION` 宏定义改掉
```
#define LATEST_VERSION		KERNEL_VERSION(5, 20, 7) /* linux-5.20.7 */
```

还有一个是要看 为什么获得kernel version不对
```
[    3.917016] kdump-tools[301]: Starting kdump-tools:
[    3.919053] kdump-tools[308]:  * running makedumpfile -c -d 31 /proc/vmcore /var/crash/202101192153/dump-incomplete
[    3.930292] kdump-tools[392]: create_dumpfile: create_dumpfile!
[    3.943676] kdump-tools[392]: check_release: info->system_utsname.release: 5.11.0-rc4+.
[    3.955855] kdump-tools[392]: check_release: info->release: .rc4+.
Copying data                                      : [100.0 %] \           eta:
```

看代码应该是这段的问题
```
check_release(void)
{
	unsigned long utsname;

	/*
	 * Get the kernel version.
	 */
	if (SYMBOL(system_utsname) != NOT_FOUND_SYMBOL) {
		utsname = SYMBOL(system_utsname);
	} else if (SYMBOL(init_uts_ns) != NOT_FOUND_SYMBOL) {
                utsname = SYMBOL(init_uts_ns) + sizeof(int); //??????
	} else {
		ERRMSG("Can't get the symbol of system_utsname.\n");
		return FALSE;
	}
}
```
去掉 ` + sizeof(int)` 即可正常工作

```
[    3.917016] kdump-tools[3https://github.com/crash-utility/crash01]: Starting kdump-tools:
[    3.919053] kdump-tools[308]:  * running makedumpfile -c -d 31 /proc/vmcore /var/crash/202101192153/dump-incomplete
[    3.943676] kdump-tools[392]: check_release: info->system_utsname.release: 5.11.0-rc4+.
[    3.955855] kdump-tools[392]: check_release: info->release: 5.11.0-rc4+.
Copying data                                      : [100.0 %] \           eta: 0s
```


2. crash 版本较低不合适
拿到转存储的dump文件之后，就可以用crash 来分析了

`ubuntu 20.04` 自带的 crash版本是 `7.2.8`
```
stable_kernel@kernel: /var/crash/202101192317# sudo crash dump.202101192317 vmlinux

crash 7.2.8
Copyright (C) 2002-2020  Red Hat, Inc.
Copyright (C) 2004, 2005, 2006, 2010  IBM Corporation
Copyright (C) 1999-2006  Hewlett-Packard Co
Copyright (C) 2005, 2006, 2011, 2012  Fujitsu Limited
Copyright (C) 2006, 2007  VA Linux Systems Japan K.K.
Copyright (C) 2005, 2011  NEC Corporation
Copyright (C) 1999, 2002, 2007  Silicon Graphics, Inc.
Copyright (C) 1999, 2000, 2001, 2002  Mission Critical Linux, Inc.
This program is free software, covered by the GNU General Public License,
and you are welcome to change it and/or distribute copies of it under
certain conditions.  Enter "help copying" to see the conditions.
This program has absolutely no warranty.  Enter "help warranty" for details.

GNU gdb (GDB) 7.6
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "x86_64-unknown-linux-gnu"...

WARNING: kernel relocated [702MB]: patching 130299 gdb minimal_symbol values

please wait... (patching 130299 gdb minimal_symbol values) [1]    4172 segmentation fault  sudo crash dump.202101192317 vmlinux
```

发现一直是有 segmentfault..
怎么也没法解决，才想到可能是 `crash` 根据版本较低导致的。

找到 crash [源码](https://github.com/crash-utility/crash)

找到 `7.2.8` 的release版本， 发现最新的版本是 `7.2.9`
就下载了7.2.9版本编译安装，其中还需要下载 `gdb-7.6`,建议直接国内源下载

但是还会出现如下错误
```
stable_kernel@kernel: /var/crash/202101192317# sudo crash dump.202101192317 vmlinux
This GDB was configured as "x86_64-unknown-linux-gnu"...

WARNING: kernel relocated [702MB]: patching 130299 gdb minimal_symbol values

      KERNEL: vmlinux
    DUMPFILE: dump.202101192317  [PARTIAL DUMP]
        CPUS: 4
        DATE: Tue Jan 19 23:17:07 CST 2021
      UPTIME: 00:03:31
LOAD AVERAGE: 0.06, 0.06, 0.01
       TASKS: 476
    NODENAME: rlk-Standard-PC-i440FX-PIIX-1996
     RELEASE: 5.11.0-rc4+
     VERSION: #27 SMP Tue Jan 19 13:36:03 CST 2021
     MACHINE: x86_64  (3692 Mhz)
      MEMORY: 2 GB
       PANIC: "Kernel panic - not syncing: sysrq triggered crash"
         PID: 3655
crash: cannot determine length of symbol: log_end
```

最后看了看 crash github 的 issue,地一个 open 的问题就是这个...
[issuse-74](https://github.com/crash-utility/crash/issues/74)

```
The crash-7.2.9 doesn't support the 5.10 kernel. It needs these two patches
a5531b2 and 71e159c, so please use the latest master if possible.
```

果然用最新 master 分支编译安装就 轻松秒杀。。（crash 工具编译安装很省心，没有过多依赖）

```
stable_kernel@kernel: /var/crash/202101192317# sudo crash dump.202101192317 vmlinux
This GDB was configured as "x86_64-unknown-linux-gnu"...

WARNING: kernel relocated [702MB]: patching 130299 gdb minimal_symbol values

      KERNEL: vmlinux
    DUMPFILE: dump.202101192317  [PARTIAL DUMP]
        CPUS: 4
        DATE: Tue Jan 19 23:17:07 CST 2021
      UPTIME: 00:03:31
LOAD AVERAGE: 0.06, 0.06, 0.01
       TASKS: 476
    NODENAME: rlk-Standard-PC-i440FX-PIIX-1996
     RELEASE: 5.11.0-rc4+
     VERSION: #27 SMP Tue Jan 19 13:36:03 CST 2021
     MACHINE: x86_64  (3692 Mhz)
      MEMORY: 2 GB
       PANIC: "Kernel panic - not syncing: sysrq triggered crash"
         PID: 3655
     COMMAND: "bash"
        TASK: ffff9aa984598d80  [THREAD_INFO: ffff9aa984598d80]
         CPU: 1
       STATE: TASK_RUNNING (PANIC)

crash> exit

```


这里就不记录具体使用了，在后面具体案例再记录