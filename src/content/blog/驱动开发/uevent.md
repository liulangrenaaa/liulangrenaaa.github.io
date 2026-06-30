---
title: uevent
date: 2024-10-11 19:00:00
tags:
    - drivers
    - uevent
categories:
    - linux内核
slug: "驱动开发/uevent"
---



## 什么是uevent
Uevent是Kobject的一部分，用于在Kobject状态发生改变时，例如增加、移除等，通知用户空间程序。
用户空间程序收到这样的事件后，会做相应的处理。
该机制通常是用来支持热拔插设备的，例如U盘插入后，USB相关的驱动软件会动态创建用于表示该U盘的device结构（相应的也包括其中的kobject），
并告知用户空间程序，为该U盘动态的创建/dev/目录下的设备节点，更进一步，可以通知其它的应用程序，
将该U盘设备mount到系统中，从而动态的支持该设备。

## 什么时机 uevent 触发
设备模型中任何设备有事件需要上报时，会触发Uevent提供的接口。
Uevent模块准备好上报事件的格式后，可以通过两个途径把事件上报到用户空间：
一种是通过kmod模块，直接调用用户空间的可执行文件；
另一种是通过netlink通信机制，将事件从内核空间传递给用户空间。


Uevent的代码
```
include/linux/kobject.h
lib/kobject_uevent.c
```

```
 1: /* include/linux/kobject.h, line 50 */
 2: enum kobject_action {   
 3:     KOBJ_ADD,
 4:     KOBJ_REMOVE,    
 5:     KOBJ_CHANGE, 
 6:     KOBJ_MOVE,
 7:     KOBJ_ONLINE, 
 8:     KOBJ_OFFLINE,
 9:     KOBJ_MAX 
 10: };
```

device_add() -> kobject_uevent(&dev->kobj, KOBJ_ADD);

参考[统一设备模型：kobj、kset分析](http://www.wowotech.net/device_model/421.html)
## 什么程序会处理 uevent?
常见的有 udev, ueventd, mdev等
+ udev 是 systemd 的一部分，广泛用于桌面和服务器Linux发行版中
+ mdev 是 busybox 一部分，用于嵌入式小系统中
+ ueventd 是 android系统中的， 类似与 udev

ubuntu中
```
root@ubuntu-virtual-machine:~# ps -AT | grep udev
    466     466 ?        00:00:01 systemd-udevd
root@ubuntu-virtual-machine:~# 
```

android 中
```
TECNO-CM8:/ # ps -AT | grep ueventd
root           410   410     1   10903048   9888 poll_schedule_timeout 0 S ueventd
TECNO-CM8:/ # 
```

后续有空分析一下 mdev 执行时机

### mdev执行时机

在 /etc/init.d/rcS中
1. 扫描文件
```
mdev -s”/sys/class和/sys/block
```

2. 指定热插拔事件产生的时候 需要执行的应用程序
```
echo /sbin/mdev > /proc/sys/kernel/hotplug
```

mdev 会扫描 `/sys/class` `/sys/block` 两个目录下的文件， 然后使用 `mknod` 在 /dev/目录下创建系统文件

```
TECNO-CM8:/sys/class/input/event0 # file /dev/input/event0
/dev/input/event0: character special (13/64)
TECNO-CM8:/sys/class/input/event0 # cat dev
13:64
TECNO-CM8:/sys/class/input/event0 # 
```

### mdev 代码分析
代码在 busybox 源码中
主要是三个函数 
```
mdev_main
find_dev
make_device
```

可以看到 mdev 主要是使用 mknod来创建 /dev/目录 节点的
```
/* mknod in /dev based on a path like "/sys/block/hda/hda1" */
static void make_device(char *path, int delete)
{
```



















参考 [wowo文章](http://www.wowotech.net/device_model/uevent.html/comment-page-2#comments)
参考 [mdev详解](https://www.cnblogs.com/-glb/p/12585021.html)
参考 [Linux设备模型分析之（五）：uevent](https://blog.csdn.net/m0_46525308/article/details/115098504)
