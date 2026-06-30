---
title: dd dumpe2fs debugfs 探索文件系统
date: 2021-07-14 19:00:40
tags:
    - dd
    - dumpe2fs
    - debugfs
    - filesystem
categories:
    - linux内核
slug: "filesystem/dd-dumpe2fs-debugfs-探索文件系统"
---



## 环境准备
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
stable_kernel@kernel: ~/workspace/fs# sudo su
oot@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# dmesg > dmesg
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# cp dmesg dmesg1
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# echo suhui > file
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# pwd
/home/rlk/workspace/fs/ext2_dir
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# ln -s /home/rlk/workspace/fs/ext2_dir/file file_link
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# ls
dmesg  dmesg1  file  file_link  lost+found
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir#
```

## demo

```
stable_kernel@130kernel: ~/workspace/fs/ext2_dir# df
Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/root       32377648  21931288   8778624  72% /
devtmpfs         1873504         0   1873504   0% /dev
tmpfs            1875824         0   1875824   0% /dev/shm
tmpfs             375168      1088    374080   1% /run
tmpfs               5120         0      5120   0% /run/lock
host_share     244568380 149197884  82877440  65% /tmp/share
/dev/sda1         523248         4    523244   1% /boot/efi
tmpfs             375164        20    375144   1% /run/user/1000
/dev/loop0          3952        60      3688   2% /home/rlk/workspace/fs/ext2_dir
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dumpe2fs /dev/loop0
dumpe2fs 1.45.5 (07-Jan-2020)
Filesystem volume name:   <none>
Last mounted on:          <not available>
Filesystem UUID:          7e4b766b-1cd0-4bb4-b53f-6cf250f4d1d0
Filesystem magic number:  0xEF53
Filesystem revision #:    1 (dynamic)
Filesystem features:      ext_attr resize_inode dir_index filetype sparse_super large_file
Filesystem flags:         signed_directory_hash
Default mount options:    user_xattr acl
Filesystem state:         not clean
Errors behavior:          Continue
Filesystem OS type:       Linux
Inode count:              1024
Block count:              1024
Reserved block count:     51
Free blocks:              973
Free inodes:              1009
First block:              0
Block size:               4096
Fragment size:            4096
Blocks per group:         32768
Fragments per group:      32768
Inodes per group:         1024
Inode blocks per group:   32
Filesystem created:       Tue Jul 13 15:53:45 2021
Last mount time:          n/a
Last write time:          Tue Jul 13 15:54:49 2021
Mount count:              2
Maximum mount count:      -1
Last checked:             Tue Jul 13 15:53:45 2021
Check interval:           0 (<none>)
Reserved blocks uid:      0 (user root)
Reserved blocks gid:      0 (group root)
First inode:              11
Inode size:               128
Default directory hash:   half_md4
Directory Hash Seed:      a894ce52-595d-4d99-aa0e-10289f427598


Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  973 free blocks, 1009 free inodes, 2 directories
  Free blocks: 42-50, 60-1023
  Free inodes: 16-1024
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

### inode
可以通过 `ls` 看到 `file`的 `inode` 号
```
LS(1)                                               User Commands                                               LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...
......
       -i, --inode
              print the index number of each file
......
```

```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 60
     2 drwxr-xr-x 3 root root  4096 7月  13 15:58 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root     0 7月  13 15:57 dmesg
    13 -rw-r--r-- 1 root root 34001 7月  13 15:57 dmesg1
    14 -rw-r--r-- 1 root root     0 7月  13 15:57 file
    15 lrwxrwxrwx 1 root root    36 7月  13 15:58 file_link -> /home/rlk/workspace/fs/ext2_dir/file
    11 drwx------ 2 root root 16384 7月  13 15:53 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
可以看到 `dmesg` 的 `inode`号 是 12

### regular file
可以通过 debugfs 看到 `inode` 号为 12的 文件详细信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <12>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 12   Type: regular    Mode:  0644   Flags: 0x0
Generation: 2322689703    Version: 0x00000000
User:     0   Group:     0   Size: 34178
File ACL: 0
Links: 1   Blockcount: 72
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ed4ae9 -- Tue Jul 13 16:12:25 2021
atime: 0x60ed4753 -- Tue Jul 13 15:57:07 2021
mtime: 0x60ed4ae9 -- Tue Jul 13 16:12:25 2021
BLOCKS:
(0-8):42-50
TOTAL: 9
```
可以看到文件类型是 `regular`，权限是 `0644`，size 是 `34178`;
其中 BLOCKS 是 42-50 之间。

通过`dd` 工具 将 `block-42` 内容dump出来：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=42 count=1 | xxd -b -l 32
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.6639e-05 s, 87.8 MB/s
00000000: 01011011 00100000 00100000 00100000 00100000 00110000  [    0
00000006: 00101110 00110000 00110000 00110000 00110000 00110000  .00000
0000000c: 00110000 01011101 00100000 01001100 01101001 01101110  0] Lin
00000012: 01110101 01111000 00100000 01110110 01100101 01110010  ux ver
00000018: 01110011 01101001 01101111 01101110 00100000 00110101  sion 5
0000001e: 00101110 00110001                                      .1
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat dmesg | head -n 3
[    0.000000] Linux version 5.14.0-rc1+ (ubuntu@ubuntu-HP-ProDesk-680-G4-MT) (gcc (Ubuntu 10.3.0-1ubuntu1) 10.3.0, GNU ld (GNU Binutils for Ubuntu) 2.36.1) #48 SMP Tue Jul 13 10:42:02 CST 2021
[    0.000000] Command line: root=/dev/sda5 console=ttyS0 crashkernel=256M systemd.unified_cgroup_hierarchy=1
[    0.000000] x86/fpu: x87 FPU will use FXSAVE
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
可以看到 skip 42 个 block之后，dd 出来一个 block 内容就是 `dmesg` 文件的内容。


### directory
在目录下创建 目录，并新建两个文件
```
stable_kernel@1kernel: ~/workspace/fs/ext2_dir# sudo mkdir tmp
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo touch tmp/filename_1
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo touch tmp/filename_2
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -alhi
total 104K
     2 drwxr-xr-x 4 root root 4.0K 7月  13 16:53 .
791692 drwxrwxr-x 3 rlk  rlk  4.0K 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root  35K 7月  13 16:45 dmesg
    13 -rw-r--r-- 1 root root  35K 7月  13 16:45 dmesg1
    14 -rw-r--r-- 1 root root    6 7月  13 16:45 file
    15 lrwxrwxrwx 1 root root   36 7月  13 16:46 file_link -> /home/rlk/workspace/fs/ext2_dir/file
    11 drwx------ 2 root root  16K 7月  13 16:45 lost+found
    16 drwxr-xr-x 2 root root 4.0K 7月  13 16:55 tmp
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

可以看到 `tmp` dir的 `inode`号 是 16，通过 debugfs 看到 `inode` 号为 16的 文件详细信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <16>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 16   Type: directory    Mode:  0755   Flags: 0x0
Generation: 2149799966    Version: 0x00000000
User:     0   Group:     0   Size: 4096
File ACL: 0
Links: 2   Blockcount: 8
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ed550e -- Tue Jul 13 16:55:42 2021
atime: 0x60ed547e -- Tue Jul 13 16:53:18 2021
mtime: 0x60ed550e -- Tue Jul 13 16:55:42 2021
BLOCKS:
(0):61
TOTAL: 1
```
可以看到文件类型是 `directory`，权限是 `0755`，size 是 `4096`;
文件比较小，只包含一个 block，位于 block 61位置处。

通过`dd` 工具 将 `block-61` 内容dump出来：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=61 count=1 | xxd -u  -l 150
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 7.5436e-05 s, 54.3 MB/s
00000000: 1000 0000 0C00 0102 2E00 0000 0200 0000  ................
00000010: 0C00 0202 2E2E 0000 1100 0000 1400 0A01  ................
00000020: 6669 6C65 6E61 6D65 5F31 0000 1200 0000  filename_1......
00000030: D40F 0A01 6669 6C65 6E61 6D65 5F32 0000  ....filename_2..
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000080: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000090: 0000 0000 0000                           ......
```
`.` ascii 是 `2E`
`..` ascii 是 `2E2E`
`filename_1` ascii 是 `6669 6C65 6E61 6D65 5F31`
`filename_1` ascii 是 `6669 6C65 6E61 6D65 5F32`

dir entry 的 `data block` 数据需要结合 `struct ext2_dir_entry_2` 来看：
```
struct ext2_dir_entry_2 {
	__le32	inode;			/* Inode number */
	__le16	rec_len;		/* Directory entry length */
	__u8	name_len;		/* Name length */
	__u8	file_type;
	char	name[];			/* File name, up to EXT2_NAME_LEN */
};
```
在 filename 之前有 `8 bytes` file name的属性

`filename_1` 对应的是 `1100 0000 1400 0A01`， inode是 `0x11`，即 `17`；rec_len是 `0x14`；
name_len 是 `0x0A`，即10 byte, file type是 1。

`.` 对应的是 `1000 0000 0C00 0102`， inode是 `0x10`，即 `16`，与 tmp 的inode号一致；rec_len是 `0x0c`；
name_len 是 `0x01`，即1 byte, file type是 2。

`..` 对应的是 `0200 0000 0C00 0202`， inode是 `0x02`，即 `2`，与 ext2_dir 的inode号一致；rec_len是 `0x0c`；
name_len 是 `0x02`，即1 byte, file type是 2。

每个filename结尾都自动加了 `\0\0`

#### directory 下目录文件太多怎么办
通过上面 demo可以看出，dir的 `data block` 是存储的目录的 `inode` 和 `filename` 等信息，按照文件名字 10 byte,大概一个文件占用 20byte空间，而 `data block` 大小是 4096 byte，所以至少创建 200+ 文件才能使得 `dir inode` 的 `data block` 数量大于1；通过命令`for i in $(seq 1 250); do sudo touch filename_$i; done`自动创建 250 个文件

通过`debugfs` 查看此时`inode-16`的信息：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo debugfs -R "stat <16>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 16   Type: directory    Mode:  0755   Flags: 0x0
Generation: 2149799966    Version: 0x00000000
User:     0   Group:     0   Size: 8192
File ACL: 0
Links: 2   Blockcount: 16
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ed7ae7 -- Tue Jul 13 19:37:11 2021
atime: 0x60ed5917 -- Tue Jul 13 17:12:55 2021
mtime: 0x60ed7ae7 -- Tue Jul 13 19:37:11 2021
BLOCKS:
(0):61, (1):64
TOTAL: 2
```
由于此时`tmp` 目录下文件很多，导致此时一个 `data block` 无法存储所有目录项的`inode` 和 `filename` 信息等，扩展到了 两个 `data block`。



通过dd查看 `block-61`  尾部数据
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo dd if=/dev/loop0 bs=4096 skip=61 count=1 | xxd -u  -l 4096 | tail -n 10
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 3.5019e-05 s, 117 MB/s
00000f60: 6E61 6D65 5F31 3936 D600 0000 1400 0C01  name_196........
00000f70: 6669 6C65 6E61 6D65 5F31 3937 D700 0000  filename_197....
00000f80: 1400 0C01 6669 6C65 6E61 6D65 5F31 3938  ....filename_198
00000f90: D800 0000 1400 0C01 6669 6C65 6E61 6D65  ........filename
00000fa0: 5F31 3939 D900 0000 1400 0C01 6669 6C65  _199........file
00000fb0: 6E61 6D65 5F32 3030 DA00 0000 1400 0C01  name_200........
00000fc0: 6669 6C65 6E61 6D65 5F32 3031 DB00 0000  filename_201....
00000fd0: 1400 0C01 6669 6C65 6E61 6D65 5F32 3032  ....filename_202
00000fe0: DC00 0000 2000 0C01 6669 6C65 6E61 6D65  .... ...filename
00000ff0: 5F32 3033 0000 0000 0000 0000 0000 0000  _203............
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```

通过dd查看 `block-64`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo dd if=/dev/loop0 bs=4096 skip=64 count=1 | xxd -u  -l 150
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 3.4552e-05 s, 119 MB/s
00000000: DD00 0000 1400 0C01 6669 6C65 6E61 6D65  ........filename
00000010: 5F32 3034 DE00 0000 1400 0C01 6669 6C65  _204........file
00000020: 6E61 6D65 5F32 3035 DF00 0000 1400 0C01  name_205........
00000030: 6669 6C65 6E61 6D65 5F32 3036 E000 0000  filename_206....
00000040: 1400 0C01 6669 6C65 6E61 6D65 5F32 3037  ....filename_207
00000050: E100 0000 1400 0C01 6669 6C65 6E61 6D65  ........filename
00000060: 5F32 3038 E200 0000 1400 0C01 6669 6C65  _208........file
00000070: 6E61 6D65 5F32 3039 E300 0000 1400 0C01  name_209........
00000080: 6669 6C65 6E61 6D65 5F32 3130 E400 0000  filename_210....
00000090: 1400 0C01 6669                           ....fi
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```
`data block-61` 和 `data block-64` 数据内容是正好相连的。




### link
link 在 linux上也分为两种`soft link` 和 `hard link`。
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 120
     2 drwxr-xr-x 5 root root  8192 7月  13 20:29 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    14 -rw-r--r-- 2 root root     6 7月  13 16:45 file
    15 lrwxrwxrwx 1 root root    36 7月  13 16:46 file_link -> /home/rlk/workspace/fs/ext2_dir/file
    14 -rw-r--r-- 2 root root     6 7月  13 16:45 file_link_hard
```
`file` 是实际文件，inode号是 14
`file_link` 是软链接，inode号是 15
`file_link_hard` 是硬链接，inode号是 14

#### soft link
通过`debugfs` 查看此时`file_link`的 inode，即`inode-15`的信息：
```
Inode: 15   Type: symlink    Mode:  0777   Flags: 0x0
Generation: 2149799965    Version: 0x00000000
User:     0   Group:     0   Size: 36
File ACL: 0
Links: 1   Blockcount: 0
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ed52ce -- Tue Jul 13 16:46:06 2021
atime: 0x60ed52d0 -- Tue Jul 13 16:46:08 2021
mtime: 0x60ed52ce -- Tue Jul 13 16:46:06 2021
Fast link dest: "/home/rlk/workspace/fs/ext2_dir/file"
```
可以看到文件类型是 `symlink`，权限是 `0777`，size 是 `36`，就是软链接地址字符的长度;
并不包含 `data block` 区域。



#### hard link
通过`debugfs` 查看此时`file_link_hard`的 inode，即`inode-14`的信息：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <14>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 14   Type: regular    Mode:  0644   Flags: 0x0
Generation: 2149799964    Version: 0x00000000
User:     0   Group:     0   Size: 6
File ACL: 0
Links: 2   Blockcount: 8
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ed8722 -- Tue Jul 13 20:29:22 2021
atime: 0x60ed52c6 -- Tue Jul 13 16:45:58 2021
mtime: 0x60ed52c6 -- Tue Jul 13 16:45:58 2021
BLOCKS:
(0):60
TOTAL: 1
```
和 file 的inode号一样，所以 hardlink 在删除源文件之后，仍然是存在的。
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -alhi
total 120K
     2 drwxr-xr-x 5 root root 8.0K 7月  13 20:43 .
791692 drwxrwxr-x 3 rlk  rlk  4.0K 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root  35K 7月  13 16:45 dmesg
    13 -rw-r--r-- 1 root root  35K 7月  13 16:45 dmesg1
    14 -rw-r--r-- 2 root root    6 7月  13 16:45 file
    15 lrwxrwxrwx 1 root root   36 7月  13 16:46 file_link -> /home/rlk/workspace/fs/ext2_dir/file
    14 -rw-r--r-- 2 root root    6 7月  13 16:45 file_link_hard
    19 drwxr-xr-x 2 root root 4.0K 7月  13 17:41 file.txt
    11 drwx------ 2 root root  16K 7月  13 16:45 lost+found
    16 drwxr-xr-x 2 root root 8.0K 7月  13 19:37 tmp
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat file
suhui
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat file_link_hard
suhui
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo rm file
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cat file_link_hard
suhui
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

#### soft link 与 hard link 如何区分
在 `.` 目录中 `hard link` 和 `soft link` 如何存储的？
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 24
     2 drwxr-xr-x 3 root root  4096 7月  14 10:52 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root     0 7月  14 10:51 1
    13 -rw-r--r-- 1 root root     0 7月  14 10:51 2
    14 -rw-r--r-- 2 root root     0 7月  14 10:51 file
    15 lrwxrwxrwx 1 root root    36 7月  14 10:52 file_link -> /home/rlk/workspace/fs/ext2_dir/file
    14 -rw-r--r-- 2 root root     0 7月  14 10:51 file_link_hard
    11 drwx------ 2 root root 16384 7月  14 10:51 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

通过`debugfs` 看到 `inode-2` 的详细信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <2>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 2   Type: directory    Mode:  0755   Flags: 0x0
Generation: 0    Version: 0x00000000
User:     0   Group:     0   Size: 4096
File ACL: 0
Links: 3   Blockcount: 8
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ee516d -- Wed Jul 14 10:52:29 2021
atime: 0x60ee5172 -- Wed Jul 14 10:52:34 2021
mtime: 0x60ee516d -- Wed Jul 14 10:52:29 2021
BLOCKS:
(0):36
TOTAL: 1
```

通过`dd` 工具 将 `data block-36` 内容dump出来：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=36 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.8568e-05 s, 84.3 MB/s
00000000: 0200 0000 0C00 0102 2E00 0000 0200 0000  ................
00000010: 0C00 0202 2E2E 0000 0B00 0000 1400 0A02  ................
00000020: 6C6F 7374 2B66 6F75 6E64 0000 0C00 0000  lost+found......
00000030: 0C00 0101 3100 0000 0D00 0000 0C00 0101  ....1...........
00000040: 3200 0000 0E00 0000 0C00 0401 6669 6C65  2...........file
00000050: 0E00 0000 1800 0E01 6669 6C65 5F6C 696E  ........file_lin
00000060: 6B5F 6861 7264 0000 0F00 0000 980F 0907  k_hard..........
00000070: 6669 6C65 5F6C 696E 6B00 0000 0000 0000  file_link.......
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

可以看到 各个文件属性
+ `file`: `0E00 0000 0C00 0401`
+ `file_link_hard`: `0E00 0000 1800 0E01`
+ `file_link`: `0F00 0000 980F 0907`

`file` 对应的是 `0E00 0000 0C00 0401`， inode是 `0x0E`，即 `14`，与 file 的inode号一致；rec_len是 `0x0c`；
name_len 是 `0x04`，即4 byte, file type是 1。

`file_link_hard` 对应的是 `0E00 0000 1800 0E01`， inode是 `0x0E`，即 `14`，与 file_link_hard 的inode号一致；rec_len是 `0x18`；
name_len 是 `0x0E`，即14 byte, file type是 1。

`file_link` 对应的是 `0F00 0000 980F 0907`， inode是 `0x0F`，即 `15`，与 file_link 的inode号一致；rec_len是 `0x980F`；
name_len 是 `0x09`，即9 byte, file type是 7。

### empty dir entry
众所周知，linux 文件系统中，至少包含两个文件`.` 和 `..`。
所以`empty dir entry` 和普通 `dir entry` 没有什么区别。


### empty file

`filename_1` 是一个空文件
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# cat filename_1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# ls -i filename_1
17 filename_1
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```

通过`debugfs` 看到 `inode-17` 的详细信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo debugfs -R "stat <17>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 17   Type: regular    Mode:  0644   Flags: 0x0
Generation: 2853187968    Version: 0x00000000
User:     0   Group:     0   Size: 0
File ACL: 0
Links: 1   Blockcount: 0
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ee5464 -- Wed Jul 14 11:05:08 2021
atime: 0x60ee559d -- Wed Jul 14 11:10:21 2021
mtime: 0x60ee5464 -- Wed Jul 14 11:05:08 2021
BLOCKS:

(END)
```
可以看到 file type等，但是最后 BLOCKS是 空的，意味着 `inode-17` 对应的文件是没有 `data block` 的，没有数据块，也就是空文件。



## ext2 磁盘文件系统布局分析
通过 `dumpe2fs` 可以看到系统 `inode-size` `Block-size` 等信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo dumpe2fs /dev/loop0 | grep size
dumpe2fs 1.45.5 (07-Jan-2020)
Filesystem features:      ext_attr resize_inode dir_index filetype sparse_super large_file
Block size:               4096
Fragment size:            4096
Inode size:               128
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```

还可以看到 group 块组的信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo dumpe2fs /dev/loop0 | tail -n 8
dumpe2fs 1.45.5 (07-Jan-2020)
Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  980 free blocks, 758 free inodes, 3 directories
  Free blocks: 44-1023
  Free inodes: 267-1024
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```

可以将 ext2.img 分成 若干个`4k` 小块:
```
             group description      inode bitmap

+-----------+----------+-----------+------------+---------------------------------+----------+-----------+------------------------------+
|           |          |           |            |                                 |          |           |                              |
|           |          |           |            |                                 |          |           |                              |
|           |          |           |            |                                 |          |           |                              |
+-----------+----------+-----------+------------+---------------------------------+----------+-----------+------------------------------+

  super block          block bitmap                  inode table= (35 - 4 +1) * 4096 = 131072

                                                      131072 / 128 = 1024
```

+ `block-0`: super block
+ `block-1`: group description
+ `block-2`: block bitmap
+ `block-3`: inode bitmap
+ `block-4<-->35`: inode table, inode-size = 128，这个 group中 有 32个 block 作为 inode-table，总size 是 32 * 4096 = 131072，inode 个数是 131072 / 128 = 1024
+ `block-36<-->1023`: data block，是实际存储数据的block，`empty file` 没有 `data block`


### 从 inode 到 data block
通过 `dumpe2fs` 可以看到系统 `inode-size` `Block-size` 等信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# sudo dumpe2fs /dev/loop0 | tail -n 8
dumpe2fs 1.45.5 (07-Jan-2020)
Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  980 free blocks, 758 free inodes, 3 directories
  Free blocks: 44-1023
  Free inodes: 267-1024
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```

可以看到从 `block-4` 开始是 `inode table`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ailtotal 32
     2 drwxr-xr-x 4 root root  4096 7月  14 11:04 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
```
`.` 的 inode号是 `2`

inode-size 是 128，将 `block-4` 前 256 bytes dump出来：
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=4 count=1 | xxd -u  -l 256
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.924e-05 s, 83.2 MB/s
00000000: 0000 0000 0000 0000 3151 EE60 3151 EE60  ........1Q.`1Q.`
00000010: 3151 EE60 0000 0000 0000 0000 0000 0000  1Q.`............
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000080: ED41 0000 0010 0000 4F54 EE60 4E54 EE60  .A......OT.`NT.`
00000090: 4E54 EE60 0000 0000 0000 0400 0800 0000  NT.`............
000000a0: 0000 0000 0000 0000 2400 0000 0000 0000  ........$.......
000000b0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000c0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000d0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000e0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000f0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

在对 inode 磁盘结构不清楚的情况下，只知道 `inode-2` 对应的 `data block` 是 `36`，即`0x24`

`inode-2` 完整数据是
```
00000080: ED41 0000 0010 0000 4F54 EE60 4E54 EE60  .A......OT.`NT.`
00000090: 4E54 EE60 0000 0000 0000 0400 0800 0000  NT.`............
000000a0: 0000 0000 0000 0000 2400 0000 0000 0000  ........$.......
000000b0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000c0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000d0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000e0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
000000f0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
```

结合 `struct ext2_inode` 来看
```
/*
 * Structure of an inode on the disk
 */
struct ext2_inode {
	__le16	i_mode;		/* File mode */
	__le16	i_uid;		/* Low 16 bits of Owner Uid */
	__le32	i_size;		/* Size in bytes */
	__le32	i_atime;	/* Access time */
	__le32	i_ctime;	/* Creation time */
	__le32	i_mtime;	/* Modification time */
	__le32	i_dtime;	/* Deletion Time */
	__le16	i_gid;		/* Low 16 bits of Group Id */
	__le16	i_links_count;	/* Links count */
	__le32	i_blocks;	/* Blocks count */
	__le32	i_flags;	/* File flags */
	union {
		struct {
			__le32  l_i_reserved1;
		} linux1;
		struct {
			__le32  h_i_translator;
		} hurd1;
		struct {
			__le32  m_i_reserved1;
		} masix1;
	} osd1;				/* OS dependent 1 */
	__le32	i_block[EXT2_N_BLOCKS];/* Pointers to blocks */
	__le32	i_generation;	/* File version (for NFS) */
	__le32	i_file_acl;	/* File ACL */
	__le32	i_dir_acl;	/* Directory ACL */
	__le32	i_faddr;	/* Fragment address */
	union {
		struct {
			__u8	l_i_frag;	/* Fragment number */
			__u8	l_i_fsize;	/* Fragment size */
			__u16	i_pad1;
			__le16	l_i_uid_high;	/* these 2 fields    */
			__le16	l_i_gid_high;	/* were reserved2[0] */
			__u32	l_i_reserved2;
		} linux2;
		struct {
			__u8	h_i_frag;	/* Fragment number */
			__u8	h_i_fsize;	/* Fragment size */
			__le16	h_i_mode_high;
			__le16	h_i_uid_high;
			__le16	h_i_gid_high;
			__le32	h_i_author;
		} hurd2;
		struct {
			__u8	m_i_frag;	/* Fragment number */
			__u8	m_i_fsize;	/* Fragment size */
			__u16	m_pad1;
			__u32	m_i_reserved2[2];
		} masix2;
	} osd2;				/* OS dependent 2 */
};
```

第41 byte 是 block pointers，即 `0x24(36)`
```
__le32	i_block[EXT2_N_BLOCKS];/* Pointers to blocks */
```

第33 byte 是 block count，即 `0x8(8)` (按照 block-size == 512 计算)
```
	__le32	i_blocks;	/* Blocks count */
```
和 `dir->i_blocks >> (PAGE_SHIFT - 9)` `dir->i_blocks >> (12 - 9)`计算 方式一致

第29 byte 是 links count，即 `0x4(4)`
```
	__le16	i_links_count;	/* Links count */
```

与 debugfs 结果一致
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <2>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 2   Type: directory    Mode:  0755   Flags: 0x0
Generation: 0    Version: 0x00000000
User:     0   Group:     0   Size: 4096
File ACL: 0
Links: 4   Blockcount: 8
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ee6d97 -- Wed Jul 14 12:52:39 2021
atime: 0x60ee6e96 -- Wed Jul 14 12:56:54 2021
mtime: 0x60ee6d97 -- Wed Jul 14 12:52:39 2021
BLOCKS:
(0):36
TOTAL: 1

(END)
```

### super block

### Group descriptors
GDT（Group Descriptor Table）组描述符表：
由多组描述符组成，整个分区分成多少个组就对应多少个组描述符。
每个组描述符（Group Descriptor）存储一个组的描述信息，例如这个组中从哪里是inode表、
哪里开始是数据块、空闲的inode和数据块还有多少等。


### Block bitmap 与 Inode bitmap
重新格式化 ext2.img，之后mount
由于 都只有 1024 个 inode 和 block，所以只需要 `1024 / 8 = 128 byte` 即可
查看 `Block bitmap`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 6.4301e-05 s, 63.7 MB/s
00000000: FFFF FFFF FF03 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
看到 `block(0-41)` 都已经被使用了

查看 `Inode bitmap`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=3 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 0.000236682 s, 17.3 MB/s
00000000: FF07 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
看到 `inode(1-11)` 都已经被使用了

此时 目录下
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 24
     2 drwxr-xr-x 3 root root  4096 7月  14 14:50 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    11 drwx------ 2 root root 16384 7月  14 14:50 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

#### 创建空文件
`sudo touch 1`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 24
     2 drwxr-xr-x 3 root root  4096 7月  14 14:58 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root     0 7月  14 14:58 1
    11 drwx------ 2 root root 16384 7月  14 14:50 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

查看此时 `Indoe bitmap`
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=3 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.8758e-05 s, 84.0 MB/s
00000000: FF0F 0000 0000 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
```
`bit-12` 已经 set为1了。

查看此时 `Block bitmap`，由于是空文件，`Block bitmap` 和之前保持一致
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.8515e-05 s, 84.4 MB/s
00000000: FFFF FFFF FF03 0000 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```


#### 向空文件中写数据

向文件`1` 写入数据
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# ls
1  lost+found
root@rlk-Standard-PC-i440FX-PIIX-1996:/home/rlk/workspace/fs/ext2_dir# dmesg > 1
stable_kernel@kernel: ~/workspace/fs/ext2_dir# ls -ali
total 64
     2 drwxr-xr-x 3 root root  4096 7月  14 14:58 .
791692 drwxrwxr-x 3 rlk  rlk   4096 7月  13 15:56 ..
    12 -rw-r--r-- 1 root root 38922 7月  14 15:06 1
    11 drwx------ 2 root root 16384 7月  14 14:50 lost+found
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```

通过`debugfs` 看到 `inode-12` 的详细信息
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo debugfs -R "stat <12>" /dev/loop0
debugfs 1.45.5 (07-Jan-2020)
Inode: 12   Type: regular    Mode:  0644   Flags: 0x0
Generation: 1697274386    Version: 0x00000000
User:     0   Group:     0   Size: 38922
File ACL: 0
Links: 1   Blockcount: 80
Fragment:  Address: 0    Number: 0    Size: 0
ctime: 0x60ee8d09 -- Wed Jul 14 15:06:49 2021
atime: 0x60ee8afb -- Wed Jul 14 14:58:03 2021
mtime: 0x60ee8d09 -- Wed Jul 14 15:06:49 2021
BLOCKS:
(0-9):42-51
TOTAL: 10
(END)
```
可以看出来，`inode-12` 占用了10个 `data block`, 从 `block-42` --> `block-51`。

从 `Block bitmap` 数据看
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# sudo dd if=/dev/loop0 bs=4096 skip=2 count=1 | xxd -u  -l 128
1+0 records in
1+0 records out
4096 bytes (4.1 kB, 4.0 KiB) copied, 4.911e-05 s, 83.4 MB/s
00000000: FFFF FFFF FFFF 0F00 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000030: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000050: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000060: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000070: 0000 0000 0000 0000 0000 0000 0000 0000  ................
stable_kernel@kernel: ~/workspace/fs/ext2_dir#
```
从 `FFFF FFFF FF03 0000` 到 `FFFF FFFF FFFF 0F00` 正好有 10 bit 数据被设置为了1。

这里可以看到 `Inode bitmap` 与 `Inode`, `Block bitmap` 与 `data block` 之间关系。
这里引申出两个问题：
1.为什么用df命令比du命令统计整个磁盘的已用空间非常快呢？
  因为df命令只需要查看每个块组的块位图即可，而不需要搜遍整个分区。
  相反，用du命令查看一个较大目录的已用空间就非常慢，因为不可避免地要搜遍整个目录的所有文件。
  df命令用于显示磁盘上的可使用的磁盘空间。du命令是对文件和目录磁盘使用的空间的查看。

2. 在格式化一个分区时究竟会划出多少个块组呢？
  格式化一个分区有多少个块组，主要取决于分区大小和块的大小。
  因为Block Bitmap占一个块，即4K字节，其有4K * 8bit，可以标注32K个块，
  每个块的大小为4K，即标注区域为32K * 4K = 128MB，即一个块组Group的上限为128M。
  若分区为32G，则ext2文件系统需要32 G / 128M = 256个块组。

### small file
常见的磁盘空间不够 是因为 单个文件数据过多，导致`data block` 区域被用完了，无法再分配 `data block` 区域。
还有一种是因为磁盘上存在着太多的小文件，导致 `inode` 被耗尽，而不能创建新文件的情况

先 dump 整个文件系统信息
```
stable_kernel@kernel: ~/workspace/fs# sudo dumpe2fs /dev/loop0  | tail -n 8
dumpe2fs 1.45.5 (07-Jan-2020)
Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  981 free blocks, 1012 free inodes, 2 directories
  Free blocks: 43-1023
  Free inodes: 13-1024
stable_kernel@kernel: ~/workspace/fs#
```

可以知道还剩余 1012个 `inodes`，创建 1024个 文件
```
stable_kernel@kernel: ~/workspace/fs/ext2_dir# mkdir tmp
stable_kernel@kernel: ~/workspace/fs/ext2_dir# cd tmp
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp# for i in $(seq 1 1024); do sudo touch filename_$i; done
touch: cannot touch 'filename_1012': No space left on device
touch: cannot touch 'filename_1013': No space left on device
......
touch: cannot touch 'filename_1023': No space left on device
touch: cannot touch 'filename_1024': No space left on device
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/tmp#
```

会发现最后面的几个文件都没法创建，显示 `No space left on device`，dump整个文件系统状态来看：
```
stable_kernel@1kernel: ~/workspace/fs/ext2_dir/tmp# sudo dumpe2fs /dev/loop0  | tail -n 8
dumpe2fs 1.45.5 (07-Jan-2020)
Group 0: (Blocks 0-1023)
  Primary superblock at 0, Group descriptors at 1-1
  Block bitmap at 2 (+2)
  Inode bitmap at 3 (+3)
  Inode table at 4-35 (+4)
  976 free blocks, 0 free inodes, 3 directories
  Free blocks: 48-1023
  Free inodes:
stable_kernel@kernel: ~/workspace/fs/ext2_dir/tmp#
```
会发现此时 `Free inodes` 已经是0了。





## big image
之前ext2.img 只有4MB, 导致只有一个 group
重新dd 一个 ext2.img
```
stable_kernel@kernel: ~/workspace/fs# dd if=/dev/zero of=ext2.img bs=4k count=102400
102400+0 records in
102400+0 records out
419430400 bytes (419 MB, 400 MiB) copied, 0.890318 s, 471 MB/s
stable_kernel@kernel: ~/workspace/fs# mkfs.ext2 ext2.img
mke2fs 1.45.5 (07-Jan-2020)
Discarding device blocks: done
Creating filesystem with 102400 4k blocks and 102400 inodes
Filesystem UUID: 4529647b-d4f6-4110-bf12-27b6e6df472d
Superblock backups stored on blocks:
        32768, 98304

Allocating group tables: done
Writing inode tables: done
Writing superblocks and filesystem accounting information: done
```

重新 mount 之后，dumpe2fs 看：
```
stable_kernel@kernel: ~/workspace/fs# sudo dumpe2fs /dev/loop0
dumpe2fs 1.45.5 (07-Jan-2020)
Filesystem volume name:   <none>
Last mounted on:          <not available>
Filesystem UUID:          4529647b-d4f6-4110-bf12-27b6e6df472d
Filesystem magic number:  0xEF53
Filesystem revision #:    1 (dynamic)
Filesystem features:      ext_attr resize_inode dir_index filetype sparse_super large_file
Filesystem flags:         signed_directory_hash
Default mount options:    user_xattr acl
Filesystem state:         not clean
Errors behavior:          Continue
Filesystem OS type:       Linux
Inode count:              102400
Block count:              102400
Reserved block count:     5120
Free blocks:              99108
Free inodes:              102389
First block:              0
Block size:               4096
Fragment size:            4096
Reserved GDT blocks:      24
Blocks per group:         32768
Fragments per group:      32768
Inodes per group:         25600
Inode blocks per group:   800
Filesystem created:       Wed Jul 14 15:30:15 2021
Last mount time:          n/a
Last write time:          Wed Jul 14 15:30:21 2021
Mount count:              1
Maximum mount count:      -1
Last checked:             Wed Jul 14 15:30:15 2021
Check interval:           0 (<none>)
Reserved blocks uid:      0 (user root)
Reserved blocks gid:      0 (group root)
First inode:              11
Inode size:               128
Default directory hash:   half_md4
Directory Hash Seed:      12d83817-68c9-4e5c-a665-94e370a4eb80


Group 0: (Blocks 0-32767)
  Primary superblock at 0, Group descriptors at 1-1
  Reserved GDT blocks at 2-25
  Block bitmap at 26 (+26)
  Inode bitmap at 27 (+27)
  Inode table at 28-827 (+28)
  31934 free blocks, 25589 free inodes, 2 directories
  Free blocks: 834-32767
  Free inodes: 12-25600
Group 1: (Blocks 32768-65535)
  Backup superblock at 32768, Group descriptors at 32769-32769
  Reserved GDT blocks at 32770-32793
  Block bitmap at 32794 (+26)
  Inode bitmap at 32795 (+27)
  Inode table at 32796-33595 (+28)
  31940 free blocks, 25600 free inodes, 0 directories
  Free blocks: 33596-65535
  Free inodes: 25601-51200
Group 2: (Blocks 65536-98303)
  Block bitmap at 65536 (+0)
  Inode bitmap at 65537 (+1)
  Inode table at 65538-66337 (+2)
  31966 free blocks, 25600 free inodes, 0 directories
  Free blocks: 66338-98303
  Free inodes: 51201-76800
Group 3: (Blocks 98304-102399)
  Backup superblock at 98304, Group descriptors at 98305-98305
  Reserved GDT blocks at 98306-98329
  Block bitmap at 98330 (+26)
  Inode bitmap at 98331 (+27)
  Inode table at 98332-99131 (+28)
  3268 free blocks, 25600 free inodes, 0 directories
  Free blocks: 99132-102399
  Free inodes: 76801-102400
```

生成一个文件之后
```
Group 0: (Blocks 0-32767)
  Primary superblock at 0, Group descriptors at 1-1
  Reserved GDT blocks at 2-25
  Block bitmap at 26 (+26)
  Inode bitmap at 27 (+27)
  Inode table at 28-827 (+28)
  21694 free blocks, 25588 free inodes, 2 directories
  Free blocks: 834-22527
  Free inodes: 13-25600
Group 1: (Blocks 32768-65535)
  Backup superblock at 32768, Group descriptors at 32769-32769
  Reserved GDT blocks at 32770-32793
  Block bitmap at 32794 (+26)
  Inode bitmap at 32795 (+27)
  Inode table at 32796-33595 (+28)
  10213 free blocks, 25600 free inodes, 0 directories
  Free blocks: 33596-33599, 55327-65535
  Free inodes: 25601-51200
Group 2: (Blocks 65536-98303)
  Block bitmap at 65536 (+0)
  Inode bitmap at 65537 (+1)
  Inode table at 65538-66337 (+2)
  31966 free blocks, 25600 free inodes, 0 directories
  Free blocks: 66338-98303
  Free inodes: 51201-76800
Group 3: (Blocks 98304-102399)
  Backup superblock at 98304, Group descriptors at 98305-98305
  Reserved GDT blocks at 98306-98329
  Block bitmap at 98330 (+26)
  Inode bitmap at 98331 (+27)
  Inode table at 98332-99131 (+28)
  3268 free blocks, 25600 free inodes, 0 directories
  Free blocks: 99132-102399
  Free inodes: 76801-102400
```















参考[Ext2文件系统布局及核心数据结构](https://blog.csdn.net/XD_hebuters/article/details/79574902)


