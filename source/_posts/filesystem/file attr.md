---
title: file attr
date: 2021-07-12 19:00:40
tags:
    - file attr
    - filesystem
categories:
    - linux内核
---

## file attributes 概念
除了控制用户和组读取，写和执行权限的文件模式位之外，几个文件系统支持文件属性，
可以进一步自定义允许的文件操作。
```
Apart from the file mode bits that control user and group read, write and execute permissions, several file systems support file attributes that enable further customization of allowable file operations. This section describes some of these attributes and how to work with them.
```

`cp` `rsync` 等操作不会保留 `file attributes`。
只有部分 filesystem 支持这样的属性，常见的 `ext2` `ext3` `ext4` 都是支持的。

## file attributes FLAG
`include/uapi/linux/fs.h` 中
```
/*
 * Inode flags (FS_IOC_GETFLAGS / FS_IOC_SETFLAGS)
 *
 * Note: for historical reasons, these flags were originally used and
 * defined for use by ext2/ext3, and then other file systems started
 * using these flags so they wouldn't need to write their own version
 * of chattr/lsattr (which was shipped as part of e2fsprogs).  You
 * should think twice before trying to use these flags in new
 * contexts, or trying to assign these flags, since they are used both
 * as the UAPI and the on-disk encoding for ext2/3/4.  Also, we are
 * almost out of 32-bit flags.  :-)
 *
 * We have recently hoisted FS_IOC_FSGETXATTR / FS_IOC_FSSETXATTR from
 * XFS to the generic FS level interface.  This uses a structure that
 * has padding and hence has more room to grow, so it may be more
 * appropriate for many new use cases.
 *
 * Please do not change these flags or interfaces before checking with
 * linux-fsdevel@vger.kernel.org and linux-api@vger.kernel.org.
 */
#define	FS_SECRM_FL			0x00000001 /* Secure deletion */
#define	FS_UNRM_FL			0x00000002 /* Undelete */
#define	FS_COMPR_FL			0x00000004 /* Compress file */
#define FS_SYNC_FL			0x00000008 /* Synchronous updates */
#define FS_IMMUTABLE_FL			0x00000010 /* Immutable file */
#define FS_APPEND_FL			0x00000020 /* writes to file may only append */
#define FS_NODUMP_FL			0x00000040 /* do not dump file */
#define FS_NOATIME_FL			0x00000080 /* do not update atime */
```

这些 FLAG get set 都是通过 ioctl(FS_IOC_FSGETXATTR / FS_IOC_FSSETXATTR) 命令来实现的。

可以通过`chattr`的 如下命令修改
```
a  -- append only
A  -- no atime updates
c  -- compressed
C  -- no copy on write
d  -- no dump
D  -- no synchronous directory updates
e  -- extent format
i  -- immutable
j  -- data journalling
P  -- project hierarchy
s  -- secure deletion
S  -- synchronous updates
t  -- no tail-merging
T  -- top of directory hierarchy
u  -- undeletable
```


## demo

`i` 属性就是 `immutable`，意思是不可变的。
### immutable 不可变属性
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# touch 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# touch 2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# lsattr
-------------------- ./1
-------------------- ./2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# chattr +i 1
chattr: Operation not permitted while setting flags on 1
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123# sudo chattr +i 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# lsattr
----i--------------- ./1
-------------------- ./2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# rm 1
rm: cannot remove '1': Operation not permitted
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123# rm 2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# ls
1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# sudo rm 1
rm: cannot remove '1': Operation not permitted
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123# chattr -i 1
chattr: Operation not permitted while setting flags on 1
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123# sudo chattr -i 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# rm 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# ls
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123#
```

### file attributes cp 时保留吗？

```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# touch 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# lsattr
-------------------- ./1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# sudo chattr +i 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# lsattr
----i--------------- ./1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# cp 1 2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# lsattr
----i--------------- ./1
-------------------- ./2
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# mv 1 11
mv: cannot move '1' to '11': Operation not permitted
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123# sudo mv 1 11
mv: cannot move '1' to '11': Operation not permitted
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/123#
```

可以看到在 执行 `cp` 命令时， file attributes 是不保留的。


## trace

`chattr`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# sudo strace chattr +i 1
execve("/usr/bin/chattr", ["chattr", "+i", "1"], 0x7fffa9701fd0 /* 22 vars */) = 0
......
openat(AT_FDCWD, "1", O_RDONLY|O_NONBLOCK) = 3
ioctl(3, FS_IOC_GETFLAGS, 0x7ffe9578ee3c) = 0
close(3)                                = 0
lstat("1", {st_mode=S_IFREG|0664, st_size=0, ...}) = 0
openat(AT_FDCWD, "1", O_RDONLY|O_NONBLOCK) = 3
ioctl(3, FS_IOC_SETFLAGS, 0x7ffe9578ee3c) = 0
close(3)                                = 0
......
```


`lsattr`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/123# strace lsattr
execve("/usr/bin/lsattr", ["lsattr"], 0x7ffca62b1850 /* 37 vars */) = 0
openat(AT_FDCWD, "./2", O_RDONLY|O_NONBLOCK) = 4
ioctl(4, FS_IOC_GETFLAGS, 0x7ffc5889dbac) = 0
close(4)                                = 0
write(1, "-------------------- ./2\n", 25-------------------- ./2
) = 25
getdents64(3, /* 0 entries */, 32768)   = 0
close(3)                                = 0
```