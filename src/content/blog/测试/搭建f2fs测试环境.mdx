---
title: 搭建f2fs测试环境
date: 2021-02-04 19:00:40
tags:
    - node
    - zone
categories:
    - linux内核
slug: "测试/搭建f2fs测试环境"
---




发现 f2fs 相关代码有一些优化点，想着提个patch该一下，但是手中没有使用f2fs的设备，不好验证，
然后我就想使用 mkfs.f2fs初始化一个文件，然后通过`mount`的方式去挂载，最后在文件系统上做一些
测试读写等

## 环境搭建

1. 安装f2fs 工具
[源码地址](https://git.kernel.org/pub/scm/linux/kernel/git/jaegeuk/f2fs-tools.git)
我是编译安装的，也可以尝试从命令行安装
```
Inspiron-5548@ubuntu: ~/workspace# sudo apt install f2fs-tools
```

2. 生成块文件，然后格式化块文件


```
stable_kernel@kernel: ~/workspace/f2fs# dd if=/dev/zero of=./test_f2fs bs=1M count=4096
4096+0 records in
4096+0 records out
4294967296 bytes (4.3 GB, 4.0 GiB) copied, 6.36491 s, 675 MB/s
stable_kernel@kernel: ~/workspace/f2fs# mkfs.f2fs test_f2fs

	F2FS-tools: mkfs.f2fs Ver: 1.9.0 (2017-09-21)

Info: Disable heap-based policy
Info: Debug level = 0
Info: Label =
Info: Trim is enabled
Info: Segments per section = 1
Info: Sections per zone = 1
Info: sector size = 512
Info: total sectors = 8388608 (4096 MB)
Info: zone aligned segment0 blkaddr: 512
Info: format version with
  "Linux version 5.11.0-rc6+ (root@server) (gcc (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0, GNU ld (GNU Binutils for Ubuntu) 2.34) #50 SMP Wed Feb 3 11:04:13 CST 2021"
Info: [test_f2fs] Discarding device
Info: Overprovision ratio = 3.150%
Info: Overprovision segments = 132 (GC reserved = 71)
Info: format successful
stable_kernel@kernel: ~/workspace/f2fs# mkdir test_dir
```


3. 使用 `-t f2fs` 选项挂载这个 f2fs disk
在没有使能f2fs的内核上，尝试安装，会出现如下报错
```
stable_kernel@1kernel: ~/workspace/f2fs# sudo mount -t f2fs ./test_file ./test_dir

mount: /home/rlk/workspace/f2fs/test_dir: unknown filesystem type 'f2fs'.
```

需要使能如下选项重新编译 kernel
```
if [ $debug_fsf2 == 1 ]
then
## debug_fsf2 enable start
	echo "CONFIG_F2FS_FS=y" >> /tmp/.config
	echo "CONFIG_F2FS_STAT_FS=y" >> /tmp/.config
	echo "CONFIG_F2FS_FS_XATTR=y" >> /tmp/.config
	echo "CONFIG_F2FS_FS_POSIX_ACL=y" >> /tmp/.config
	echo "CONFIG_CRYPTO_CRC32=y" >> /tmp/.config
## debug_fsf2 enable end
fi
```

重新挂载
```
stable_kernel@kernel: ~/workspace/f2fs# df -a
Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/root       32377648  19964388  10745524  66% /
......
/dev/sda1         523248         4    523244   1% /boot/efi
tmpfs             174684        24    174660   1% /run/user/1000
binfmt_misc            0         0         0    - /proc/sys/fs/binfmt_misc
stable_kernel@kernel: ~/workspace/f2fs# sudo mount -t f2fs ./test_f2fs ./test_dir
stable_kernel@kernel: ~/workspace/f2fs# df -a
Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/root       32377648  19964388  10745524  66% /
......
/dev/sda1         523248         4    523244   1% /boot/efi
tmpfs             174684        24    174660   1% /run/user/1000
binfmt_misc            0         0         0    - /proc/sys/fs/binfmt_misc
/dev/loop0       4192256    307208   3885048   8% /home/rlk/workspace/f2fs/test_dir
stable_kernel@kernel: ~/workspace/f2fs#
```

4. 读写 `test_dir` 相关目录
```

```

5. 跟踪相关 `probe`，触发 slab回收，观察

跟踪 `kprobe`
```
stable_kernel@130kernel: ~/workspace/f2fs# sudo bpftrace -e 'kretprobe:f2fs_shrink_scan {printf("[pid-%d:%s]: f2fs_shrink_scan retval %d\n",
 pid,comm, retval)}'
Attaching 1 probe...
[pid-3577:bash]: f2fs_shrink_scan retval 128
[pid-3577:bash]: f2fs_shrink_scan retval 128
[pid-3577:bash]: f2fs_shrink_scan retval 128
```

触发 `slab` 回收
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/proc/sys/vm# sudo echo 3 > drop_caches
root@rlk-Standard-PC-i440FX-PIIX-1996:/proc/sys/vm#
```

6. 发patch
最后发现是我自己天真了。。。


7. 收获

```

unsigned long f2fs_shrink_scan(struct shrinker *shrink,
				struct shrink_control *sc)
{
	unsigned long nr = sc->nr_to_scan;
	struct f2fs_sb_info *sbi;
	struct list_head *p;
	unsigned int run_no;
	unsigned long freed = 0;

	spin_lock(&f2fs_list_lock);
	do {
		run_no = ++shrinker_run_no;
	} while (run_no == 0);
	p = f2fs_list.next;
	while (p != &f2fs_list) {
		sbi = list_entry(p, struct f2fs_sb_info, s_list);

		if (sbi->shrinker_run_no == run_no)
			break;

		/* stop f2fs_put_super */
		if (!mutex_trylock(&sbi->umount_mutex)) {
			p = p->next;
			continue;
		}
		spin_unlock(&f2fs_list_lock);

		sbi->shrinker_run_no = run_no;

		/* shrink extent cache entries */
		freed += f2fs_shrink_extent_tree(sbi, nr >> 1);

		/* shrink clean nat cache entries */
		if (freed < nr)
			freed += f2fs_try_to_free_nats(sbi, nr - freed);

		/* shrink free nids cache entries */
		if (freed < nr)
			freed += f2fs_try_to_free_nids(sbi, nr - freed);

		spin_lock(&f2fs_list_lock);
		p = p->next;
		list_move_tail(&sbi->s_list, &f2fs_list);
		mutex_unlock(&sbi->umount_mutex);
		if (freed >= nr)
			break;
	}
	spin_unlock(&f2fs_list_lock);
	return freed;
}
```

在 `f2fs_shrink_scan` 中，为什么需要`list_move_tail()`？
看 `fs/ubifs/shrinker.c` 中有注释：
```
		/*
		 * Move this one to the end of the list to provide some
		 * fairness.
		 */
```

主要是让 回收过程更加公平，如果当前slab有1000个 object可以回收，只需要 回收80个object，如果不将已经回收的 `sbi` move到tail，就会导致每次都是 head的那几个`sbi` 一直被回收，但是靠近 tail的 `sbi` 虽然有很多 `slab object`，但是一直未被回收过。







参考[文档](https://www.funtoo.org/F2FS_Install_Guide)

操作
```

dd if=/dev/zero of=./test_f2fs2 bs=1M count=128

sudo mount -t f2fs ./test_f2fs ./test_dir

sudo bpftrace -e 'kretprobe:f2fs_shrink_scan {printf("[pid-%d:%s]: f2fs_shrink_scan retval %d\n", pid,comm, retval)}'


cd /proc/sys/vm && sudo su root

sudo echo 3 > drop_caches
```