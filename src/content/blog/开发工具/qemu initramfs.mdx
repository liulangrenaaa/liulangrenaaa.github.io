---
title: qemu initramfs
date: 2022-03-28 19:00:00
tags:
    - 开发工具
    - qemu
    - initramfs
categories:
    - 开发工具
slug: "开发工具/qemu-initramfs"
---



## rootfs 启动报错
在 pixel6 pro 设备中，无法使用 BiscuitOS.img
使用 /dev/vdax /dev/sdax /dev/sdbx 都是无法成功启动
```
qemu-system-aarch64 \
        -M virt \
        -m 512M \
        -cpu cortex-a72 \
        -smp 8 \
        -kernel $KERNEL_DIR \
        -device virtio-blk-device,drive=hd0 \
        -drive if=none,file=/remote/homes/hsu/myspace/BiscuitOS.img,format=raw,id=hd0 \
        -nographic \
        -append "earlycon root=$ROOTFS rw rootfstype=ext4 console=ttyAMA0 init=/linuxrc loglevel=8"
```
后报错
```
[ 2.348066][ T1] List of all partitions:
[ 2.348832][ T1] 0100 8192 ram0
[ 2.348870][ T1] (driver?)
[    2.349989][    T1] 0101            8192 ram1
[    2.350003][    T1]  (driver?)
[    2.350775][    T1] 0102            8192 ram2
......
[    2.361197][    T1] No filesystem could mount root, tried:
[    2.361230][    T1]  ext4
[    2.361979][    T1]
[    2.362761][    T1] Kernel panic - not syncing: VFS: Unable to mount root fs on unknown-block(1,0)
[    2.363560][    T1] CPU: 2 PID: 1 Comm: swapper/0 Not tainted 5.10.43-gb71001ab18ec-dirty #22
[    2.363956][    T1] Hardware name: linux,dummy-virt (DT)
[    2.364437][    T1] Call trace:
[    2.364709][    T1]  dump_backtrace+0x0/0x1d8
[    2.364939][    T1]  show_stack+0x18/0x28
[    2.365177][    T1]  dump_stack_lvl+0xd4/0xfc
[    2.365362][    T1]  dump_stack+0x18/0x58
......
[    2.367447][    T1] SMP: stopping secondary CPUs
[    2.373951][    T1] Kernel Offset: disabled
[    2.374360][    T1] CPU features: 0x000,10240022,61006000
```

## initramfs 启动

```
qemu-system-aarch64 \
    -kernel /u/hsu/workspace/pixel6pro/private/gs-google/out/arch/arm64/boot/Image \
    -initrd /u/hsu/workspace/aarch64_initramfs.cpio.gz \
    -append "console=ttyAMA0 rdinit=/linuxrc" \
    -M virt \
    -cpu cortex-a72 \
    -nographic \
    -smp 8 \
    -m 2048M
```
后启动成功
```
[    3.953909][    T1] Freeing unused kernel memory: 2944K
[    3.961262][    T1] Run /linuxrc as init process
/etc/init.d/rcS: line 25: can't create /proc/sys/kernel/hotplug: nonexistent directory
 ____  _                _ _    ___  ____
| __ )(_)___  ___ _   _(_) |_ / _ \/ ___|
|  _ \| / __|/ __| | | | | __| | | \___ \
| |_) | \__ \ (__| |_| | | |_| |_| |___) |
|____/|_|___/\___|\__,_|_|\__|\___/|____/

Welcome to BiscuitOS

Please press Enter to activate this console.
~ #
```

对于kernel的要求:
需要打开如下配置
```
CONFIG_BLK_DEV_RAM=y
CONFIG_BLK_DEV_RAM_COUNT=16
CONFIG_BLK_DEV_RAM_SIZE=65536
CONFIG_BLK_DEV_INITRD=y
```


## aarch64_initramfs.cpio.gz 文件如何制作
1. 打开如上配置之后，编译 kernel， 在 out 目录下看到 ./usr/目录
将其中 gen_initramfs.sh 与 ./usr 目录复制到 BiscuitOS.img 目录下
2. mount BiscuitOS.img 到 tmp 目录
3. 生成 aarch64_initramfs.cpio.gz 文件

```
cp $dir/out/usr/gen_initramfs.sh .
cp $dir/out/usr . -rf

sudo mount -t ext4 aarch64_BiscuitOS.img ./tmp/ -o loop

sudo ./gen_initramfs.sh  -o aarch64_initramfs.cpio.gz ./tmp/
```


## cpio.gz格式小系统 压缩与解压缩

1. 解压缩
gunzip rootfs.cpio.gz        ---> 得到rootfs.cpio文件

2. 进一步解压缩
cpio -idmv < rootfs.cpio        --->得到解压后的文件和文件夹

当添加自己想要的文件后，需要再次对文件和文件夹打包，用如下命令：
3. 压缩
find ./* | cpio -H newc -o > rootfs.cpio         ---> 得到rootfs.cpio文件
4. 进一步压缩
gzip rootfs.cpio        ---> 得到rootfs.cpio.gz文件





参考[Linux aarch64 编译 & qemu 搭建实验平台](https://blog.csdn.net/FJDJFKDJFKDJFKD/article/details/100021609)



