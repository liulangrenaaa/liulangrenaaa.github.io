---
title: adeb 工具
date: 2025-01-01 19:00:00
tags:
    - adeb
categories:
    - 开发工具
---

# 什么是adeb?
可以在android上使用的 debian rootfs, 可以在线安装一些在android上难以安装的工具
比如 ebpf 相关工具链等

使用最多的还是github上的这个rootfs
```
17:01-cy_wsl@ubuntu: ~/workspace/adeb# pwd
/home/ubuntu/workspace/adeb
17:01-cy_wsl@ubuntu: ~/workspace/adeb# git remote -vv
origin  https://github.com/joelagnel/adeb.git (fetch)
origin  https://github.com/joelagnel/adeb.git (push)
17:01-cy_wsl@ubuntu: ~/workspace/adeb#
```


# 使用
git clone 之后直接使用 adeb 就可以
```

17:03-cy_wsl@ubuntu: ~/workspace/adeb# ls
BCC.md  LICENSE  METADATA  MODULE_LICENSE_APACHE2  README.md  README.version  TODO  addons  adeb  androdeb  androdeb-fs-minimal.tgz.zip  bcc  buildimage  buildstrap  packages  utils
17:03-cy_wsl@ubuntu: ~/workspace/adeb# ./adeb prepare
/home/ubuntu/workspace/adeb
|--------------|
| adeb: v0.99h |
|--------------|
17:12:23 - INFO    : Looking for device..
17:12:23 - INFO    : Preparing device...
17:12:23 - INFO    : Doing a base install.
17:12:23 - INFO    : 
17:12:23 - INFO    : Downloading Androdeb from the web...
17:12:23 - INFO    : 
17:12:23 - INFO    : No repository URL provided in enviromnent. Attempting to auto-detect it
17:12:23 - INFO    : Detected URL: github.com/joelagnel/adeb/
suhui
/tmp/tmp.bGiq4wptLZ
https://github.com/joelagnel/adeb//releases/download/v0.99h/androdeb-fs-minimal.tgz.zip --output /tmp/tmp.bGiq4wptLZ/androdeb-fs-minimal.tgz.zip
cp /tmp/androdeb-fs-minimal.tgz.zip /tmp/tmp.bGiq4wptLZ/androdeb-fs-minimal.tgz.zip
Archive:  /tmp/tmp.bGiq4wptLZ/androdeb-fs-minimal.tgz.zip
  inflating: /tmp/tmp.bGiq4wptLZ/androdeb-fs-minimal.tgz  
17:12:24 - INFO    : Using archive at /tmp/tmp.bGiq4wptLZ/androdeb-fs-minimal.tgz for filesystem preparation
17:12:26 - INFO    : Pushing filesystem to device..
17:12:27 - INFO    : Pushing addons to device..
17:12:28 - INFO    : Unpacking filesystem in device..
17:03-cy_wsl@126ubuntu: ~/workspace/adeb# adb shell 
Infinix-X6856:/ # cd /data/androdeb/
Infinix-X6856:/data/androdeb # ls
bashrc  bashrc.common  bashrc.silent  build-debian-tar  deb.tar.gz  device-umount-all  device-unpack  get_kvers.sh  run  run-command  run.common
Infinix-X6856:/data/androdeb # chmod 777 *
Infinix-X6856:/data/androdeb # ./device-unpack
Unpack of rootfs successful!
Infinix-X6856:/data/androdeb # exit
17:04-cy_wsl@ubuntu: ~/workspace/adeb# adeb shell
/home/ubuntu/workspace/adeb
mount: '/sys/kernel/debug/tracing/'->'debian/sys/kernel/debug/tracing/': No such file or directory
chmod: chmod '/sys/kernel/debug' to 0777: Operation not permitted
chmod: chmod 'debian/sys/kernel/debug' to 0777: Operation not permitted
chmod: /sys/kernel/debug/tracing: No such file or directory
chmod: debian/sys/kernel/debug/tracing: No such file or directory

##########################################################
# Welcome to androdeb environment running on Android!    #
# Questions to: Joel Fernandes <joel@joelfernandes.org>  #
                                                         #
 Try running vim, gcc, clang, git, make, perf, filetop   #
  ..etc or apt-get install something.                    #
##########################################################

root@localhost:/# 
```

## adeb 目录

```
Infinix-X6856:/data/androdeb # ls -al
total 18
drwxrwxrwx  3 root     root   3452 2024-12-13 06:30 .
drwxrwx--x 87 system   system 4096 2024-12-13 06:29 ..
-rwxrwxrwx  1 root     root    652 2023-06-05 18:07 bashrc
-rwxrwxrwx  1 root     root    190 2023-06-05 18:07 bashrc.common
-rwxrwxrwx  1 root     root     93 2023-06-05 18:07 bashrc.silent
-rwxrwxrwx  1 root     root    566 2023-06-05 18:07 build-debian-tar
drwxrwxrwx 20 u4_a3175 89939  3452 2024-12-13 06:32 debian
-rwxrwxrwx  1 root     root    235 2023-06-05 18:07 device-umount-all
-rwxrwxrwx  1 root     root    742 2023-06-05 18:07 device-unpack
-rwxrwxrwx  1 root     root    311 2023-06-05 18:07 get_kvers.sh
-rwxrwxrwx  1 root     root    132 2023-06-05 18:07 run
-rwxrwxrwx  1 root     root    229 2023-06-05 18:07 run-command
-rwxrwxrwx  1 root     root   1282 2023-06-05 18:07 run.common
Infinix-X6856:/data/androdeb # 
```
需要使用 `device-unpack` 解压最后的 debian rootfs, 同理也可以使用 
`build-debian-tar` 打包你修改之后的的debian rootfs, adb pull 出来之后可以直接下次使用，避免重复安装软件


## 升级 adeb版本
adeb其实就是一个debian的rootfs, 在debian 10上有些软件会没有,有的版本软件版本较老功能不全.
需要升级debian11 or debian12 来安装

但是升级debian版本不能跨版本升级,只能一次升级一个版本
可以 debian10 -> debian11 -> debian12 -> unstable 这样进行,(2024.12.31 还没有出debian13!!)

我本地升级了一个 unstable版本的debian, 上传到了夸克网盘 如下:
```
「adeb.7z」，复制整段内容，打开最新版「夸克APP」即可获取。
畅享原画，免费5倍速播放，支持AI字幕和投屏，更有网盘TV版。
/~43d335IFSz~:/
链接：https://pan.quark.cn/s/2e552c4189fa
```
安装了很多性能相关工具如:
```
bpftrace-0.21
ltrace
strace
stress
```
等等
