---
title: qemu启动的ubuntu img制作
date: 2021-04-09 19:00:00
tags:
    - qemu
    - ubuntu
categories:
    - qemu
---



## 基础img是从哪里来？
直接 wget [链接](https://cloud-images.ubuntu.com/focal/20210407/)
```
wget https://cloud-images.ubuntu.com/focal/20210407/focal-server-cloudimg-arm64.img
```

参考[博客](https://spyff.github.io/linux/2018/07/20/qemu-vm/)


## 不替换kernel，如何启动这个kernel ???
```
qemu-system-aarch64 \
	-hda /home/ubuntu/myspace/qemu_build/aarch64/arm64_ubuntu.img \
	-m 2048M \
	-smp 4  \
	-M virt \
	-cpu cortex-a72 \
	-net nic \
	-net user,hostfwd=tcp::2222-:22 \
	-nographic
```


## 如何使用这个 img

这个img是直接可以启动的
```
qemu-system-aarch64 \
	-hda /home/ubuntu/myspace/qemu_build/aarch64/arm64_ubuntu.img \
	-kernel /home/ubuntu/workspace/linux-stable/out/arch/arm64/boot/Image \
	-append "console=ttyAMA0 root=/dev/vda1" \
	-m 2048M \
	-smp 4  \
	-M virt \
	-cpu cortex-a72 \
	-net nic \
	-net user,hostfwd=tcp::2222-:22 \
	-nographic
```

但是由于是 `cloud img`，所以一开始无法使用账号密码登陆，也没法通过ssh登陆。
但是可以通过 `mount` 整个 img，将主机的 ssh的 id_rsa.pub 添加到 `cloud img`的 `authorized_keys`中，然后就可以通过 `ssh` 登陆了。





## How to mount a qcow2 disk image- 方法一
This is a quick guide to mounting a qcow2 disk images on your host server. This is useful to reset passwords, edit files, or recover something without the virtual machine running.

### Step 1 - Enable NBD on the Host
```
modprobe nbd max_part=8
```

### Step 2 - Connect the QCOW2 as network block device
```
qemu-nbd --connect=/dev/nbd0 ./arm64_ubuntu.img
```

### Step 3 - Find The Virtual Machine Partitions
```
fdisk /dev/nbd0 -l
```

### Step 4 - Mount the partition from the VM
```
mount /dev/nbd0p1 /mnt/opt/
```
如果是同架构 arm64 系统则进行 chroot.
不行就改 ssh 快速登陆
chroot

### Step 5 - After you done, unmount and disconnect
```
umount /mnt/opt/
qemu-nbd --disconnect /dev/nbd0
rmmod nbd
```

## How to mount a qcow2 disk image- 方法二
### 安装 libguestfs-tools
```
sudo apt-get install libguestfs-tools
```

### help libguestfs-tools
```
ubuntu@zeku_server:~/workspace/share/simpleapp_hw_breakpoints $ guestmount --help
guestmount: FUSE module for libguestfs
guestmount lets you mount a virtual machine filesystem
Copyright (C) 2009-2020 Red Hat Inc.
Usage:
  guestmount [--options] mountpoint
Options:
  -a|--add image       Add image
  --blocksize[=512|4096]
                       Set sector size of the disk for -a option
  -c|--connect uri     Specify libvirt URI for -d option
  --dir-cache-timeout  Set readdir cache timeout (default 5 sec)
  -d|--domain guest    Add disks from libvirt guest
  --echo-keys          Don't turn off echo for passphrases
  --fd=FD              Write to pipe FD when mountpoint is ready
  --format[=raw|..]    Force disk format for -a option
  --fuse-help          Display extra FUSE options
  -i|--inspector       Automatically mount filesystems
  --help               Display help message and exit
  --key selector       Specify a LUKS key
```

### 挂载
```
sudo guestmount  -a userdata-qemu.img.qcow2 -m /dev/sda qcow2_mount_point
```

### 卸载
```
sudo guestunmount qcow2_mount_point
```


## 如何连接 到 img

1. ssh
添加key之后，可以直接使用 ssh连接
```
ssh -v ubuntu@127.0.0.1 -p 2222
```
连接之后，可以添加账号密码，修改默认账号密码

2. 账号密码


## 如何加大 img size

在长时间运行 安装软件 编译软件之后， img的size会越来越大，这时候最好可以扩展 img的大小
```
qemu-img resize ubuntu.img +10G
```

## 如何开启 numa 架构支持
```
sudo qemu-system-x86_64 -kernel /home/ubuntu/workspace/linux/out/arch/x86/boot/bzImage -hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img -append 'root=/dev/sda5 console=ttyS0 crashkernel=256M systemd.unified_cgroup_hierarchy=1' -smp cores=4,threads=1,sockets=2 -m 4G -object memory-backend-ram,id=mem0,size=2G -object memory-backend-ram,id=mem1,size=2G -numa node,memdev=mem0,cpus=0-3,nodeid=0 -numa node,memdev=mem1,cpus=4-7,nodeid=1 --enable-kvm -net nic -net user,hostfwd=tcp::2222-:22 --nographic -fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share
```


参考[ssh_ubuntu_cloud](https://gist.github.com/tpaskhalis/1e601200da499508f9a8502493091f52)
参考[Launching Ubuntu Cloud Images with QEMU](https://powersj.io/posts/ubuntu-qemu-cli/)



## 2023 新增
由于想用 bpftrace，新的内核 需要匹配新的头文件，所以考虑想用archlinux来 做cloudimage.
搜索archlinux cloudimage，找到这个 git repo: `https://github.com/archlinux/arch-boxes`
其中有指向 `https://app.vagrantup.com/archlinux/boxes/archlinux` 的链接，包含了各家 cloud image的链接，选一个 wget 下载下来。

然后去启动
```
 sudo qemu-system-x86_64 -enable-kvm -m 2048 -boot c -hda Arch-Linux-x86_64-cloudimg.qcow2 --nographic
```
这样的话是直接可以启动的，但是最后密码不对，没法登陆。

有个新的工具可以直接设置 root用户的登陆密码
```
sudo apt install libguestfs-tools
sudo virt-customize -a bionic-server-cloudimg-amd64.img --root-password password:root
```
然后 root用户密码就是 root。
(虽然是 archlinux，但是其他家的也都是一样的。arch、ubuntu、debain 都可以)


参考[修改密码](https://askubuntu.com/questions/451673/default-username-password-for-ubuntu-cloud-image)


## debain cloud image

https://cloud.debian.org/images/cloud/bookworm/daily/20230126-1272/



## qemu 指定 dts
在 aarch64 机器上，实际可以默认不配置 dts dtb 参数。
但是 实际上是 qemu 用了默认的 dts dtb.


### 如何获取 qemu 使用的 默认 dts？
+ 将 dtb dump出来
+ dtc 将 dtb 反编译出来


STEP1:
```
qemu-system-aarch64 -machine virt -machine dumpdtb=qemu.dtb
```

STEP2:
```
dtc -I dtb qemu.dtb > qemu.dts
or
dtc -I dtb -O dts -o qemu.dts qemu.dtb
```

dtc 工具需要安装 `sudo apt install device-tree-compiler`

### 如何修改自己的dts？

按照自己需求修改


### 如何编译 dts 到 dtb

```
dtc -I dts -O dtb -o qemu.dtb qemu.dts
```


## qemu 指定 gic smmu version

```
qemu-system-aarch64 -kernel \
./Image -append 'rootwait root=/dev/vda console=ttyAMA0 rootfstype=ext4 loglevel=8 earlycon nokaslr'  \
-drive file=rootfs.ext4,if=none,index=0,media=disk,format=raw,id=disk0 \
-device virtio-blk-device,drive=disk0 \
-netdev user,id=hostnet0,hostfwd=tcp::2222-:22 \
-device virtio-net-device,netdev=hostnet0 -net nic \
-m 4096M -smp 10 \
-machine virt,gic-version=3,kernel_irqchip=on,iommu=smmuv3,default_bus_bypass_iommu=true \
-cpu cortex-a72 \
-dtb /remote/swg/users/hsu/workspace/z3_g13/vendor/tools/unittesttool/scripts/qemu/dtb/UT-virt.dtb -nographic \
```

参考[virt generic virtual platform (virt)](https://www.qemu.org/docs/master/system/arm/virt.html?highlight=gic%20version)