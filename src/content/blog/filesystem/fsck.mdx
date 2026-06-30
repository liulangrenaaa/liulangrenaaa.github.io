---
title: fsck
date: 2021-07-15 19:00:40
tags:
    - fsck
    - filesystem
categories:
    - linux内核
slug: "filesystem/fsck"
---


## demo1
`ext2` for example

以 `ext2` filesystem 为例。
在qemu环境中
```
stable_kernel@kernel: ~/workspace/fs# mkdir ext2_dir
stable_kernel@kernel: ~/workspace/fs# dd if=/dev/zero of=ext2.img bs=4k count=1024
1024+0 records in
1024+0 records out
4194304 bytes (4.2 MB, 4.0 MiB) copied, 0.00530677 s, 790 MB/s
stable_kernel@kernel: ~/workspace/fs# mkfs.ext2 ext2.img
mke2fs 1.45.5 (07-Jan-2020)
Discarding device blocks: done
Creating filesystem with 1024 4k blocks and 1024 inodes

Allocating group tables: done
Writing inode tables: done
Writing superblocks and filesystem accounting information: done
stable_kernel@kernel: ~/workspace/fs# sudo mount ext2.img ext2_dir
stable_kernel@kernel: ~/workspace/fs#
stable_kernel@kernel: ~/workspace/fs/ext2_dir# echo -n "FFFFFFFF" > file
stable_kernel@130kernel: ~/workspace/fs/ext2_dir# ls -alih
total 28K
     2 drwxrwxrwx 3 root root 4.0K 7月  15 11:30 .
791692 drwxrwxr-x 3 rlk  rlk  4.0K 7月  15 14:07 ..
    12 -rw-rw-r-- 1 rlk  rlk     8 7月  15 14:09 file
    11 drwx------ 2 root root  16K 7月  15 11:28 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```


dumpe2fs 信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dumpe2fs /dev/loop0  | tail -n 8
dumpe2fs 1.45.5 (07-Jan-2020)
Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  981 free blocks, 1012 free inodes, 2 directories
  Free blocks: 43-1023
  Free inodes: 13-1024
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

`Block bitmap` 数据
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 5.4055e-05 s, 75.8 MB/s
00000000: FFFF FFFF FF07 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

`Inode bitmap` 数据
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=3 count=1 | xxd -u -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 6.0532e-05 s, 67.7 MB/s
00000000: FF0F 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```



### Block bitmap 数据被破坏
`Block bitmap` 在 `block-2` 上，`block-size`是 4096，
我们破坏掉 `block-2` 上`32--63` 区域的数据，将其改写为1；
需要跨过 4096*2+32 = 257 * 32
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat file
FFFFFFFF%
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=file of=/dev/loop0 bs=32 seek=257 count=1
0+1 records in
0+1 records out
8 bytes copied, 0.00134476 s, 5.9 kB/s
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
`skip` 是 跳过 input
`seek` 是 跳过 output

```
        seek=N skip N obs-sized blocks at start of output
        skip=N skip N ibs-sized blocks at start of input
```

将 `Block bitmap` 的 `32-63` byte 数据 dd 出来看
```
stable_kernel@kernel: ~/workspace/fs# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.4243e-05 s, 92.6 MB/s
00000000: FFFF FFFF FF07 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 4646 4646 4646 4646 0000 0000 0000 0000  FFFFFFFF........
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs#
```

可以看到与 `Block bitmap` 没被破坏之前的数据对比。

如何修复？
```
FSCK(8)                                                   System Administration                                                   FSCK(8)

NAME
       fsck - check and repair a Linux filesystem

SYNOPSIS
       fsck [-lsAVRTMNP] [-r [fd]] [-C [fd]] [-t fstype] [filesystem...] [--] [fs-specific-options]

DESCRIPTION
       fsck  is  used  to  check  and  optionally  repair  one or more Linux filesystems.  filesys can be a device name (e.g.  /dev/hdc1,
       /dev/sdb2),   a   mount   point   (e.g.    /,   /usr,   /home),   or   an   filesystem   label    or    UUID    specifier    (e.g.
       UUID=8868abf6-88c5-4a83-98b8-bfc24057f7bd  or LABEL=root).  Normally, the fsck program will try to handle filesystems on different
       physical disk drives in parallel to reduce the total amount of time needed to check all of them.

       If no filesystems are specified on the command line, and the -A option is not specified, fsck will default to checking filesystems
       in /etc/fstab serially.  This is equivalent to the -As options.

       The exit code returned by fsck is the sum of the following conditions:
```

直接检查 ext2.img
```
stable_kernel@kernel: ~/workspace/fs# fsck.ext2 ext2.img
e2fsck 1.45.5 (07-Jan-2020)
ext2.img was not cleanly unmounted, check forced.
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
Block bitmap differences:  -(257--258) -262 -(265--266) -270 -(273--274) -278 -(281--282) -286 -(289--290) -294 -(297--298) -302 -(305--306) -310 -(313--314) -318
Fix<y>? yes

ext2.img: ***** FILE SYSTEM WAS MODIFIED *****
ext2.img: 12/1024 files (0.0% non-contiguous), 43/1024 blocks
stable_kernel@1kernel: ~/workspace/fs#
```
可以看到 `fsck.ext2` 检查出了 `Block bitmap` 的 differences，选择 `y` 之后就直接修
复了。

然后 `dd` `Block bitmap` 数据看
```
stable_kernel@kernel: ~/workspace/fs# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 5.6547e-05 s, 72.4 MB/s
00000000: FFFF FFFF FF07 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs#
```
`Block bitmap`已经恢复到了 被破坏之前的数据




### Inode bitmap 数据被破坏
`Inode bitmap` 在 `block-3` 上，`block-size`是 4096，
我们破坏掉 `block-3` 上`32--63` 区域的数据，将其改写为1；
需要跨过 4096*3+32 = 385 * 32
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat file
FFFFFFFF%
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=file of=/dev/loop0 bs=32 seek=385 count=1
0+1 records in
0+1 records out
8 bytes copied, 0.00134476 s, 5.9 kB/s
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

`dd`可以看到与 `Inode bitmap` 没被破坏之前的数据对比。
```
stable_kernel@kernel: ~/workspace/fs# sudo dd if=/dev/loop0 bs=4096 skip=3 count=1 | xxd -u -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.842e-05 s, 84.6 MB/s
00000000: FF0F 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 4646 4646 4646 4646 0000 0000 0000 0000  FFFFFFFF........
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs#
```

直接可以使用 `fsck.ext2` 进行修复
```
stable_kernel@kernel: ~/workspace/fs# fsck.ext2 ext2.img
e2fsck 1.45.5 (07-Jan-2020)
ext2.img was not cleanly unmounted, check forced.
Pass 1: Checking inodes, blocks, and sizes
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information
Inode bitmap differences:  -(258--259) -263 -(266--267) -271 -(274--275) -279 -(282--283) -287 -(290--291) -295 -(298--299) -303 -(306--307) -311 -(314--315) -319
Fix<y>? yes

ext2.img: ***** FILE SYSTEM WAS MODIFIED *****
ext2.img: 12/1024 files (0.0% non-contiguous), 43/1024 blocks
stable_kernel@1kernel: ~/workspace/fs#
```

可以看到 `fsck.ext2` 检查出了 `Inode bitmap` 的 differences，选择 `y` 之后就直接修
复了。






## demo2
ext4 for example


