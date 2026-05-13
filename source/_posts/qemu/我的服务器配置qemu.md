---
title: 我的服务器配置
date: 2020-12-19 19:00:00
tags:
    - qemu
    - ubuntu
    - kvm
    - 服务器
categories:
    - server
---

## 服务器配置
我之前一直是使用 `笔记本windows+ubuntu虚拟机` 的开发配置，但是这样有几个限制：
1. ubuntu 虚拟机比较耗费资源，一到夏天笔记本风扇狂转，影响体验
2. 只在本地使用没有问题，但是有时候还想在公司或者出差的时候使用

基于以上种种限制，我就搞了腾讯云的服务器，`1H2G1M3Y` 价格好像是 300￥，还是比较便宜的。

但是直到前些天才真正用起来，主要用于编译和测试，但是一直有几个缺点：
1. 云服务器基本都是基于 KVM的，然后他还禁止了租户继续使用KVM进行虚拟化
2. 云服务器禁止了 邮件服务的端口，导致无法收发邮件
3. 云服务器在低配置（1核心2G）下，费用较低，一旦配置升高，价格急剧上升，性价比不高
4. 1核2G用来编译效率太低
5. 云服务器带宽资源比较昂贵，在本地连接云服务器的时候经常会需要连接好久才能连接上

考虑最近AMD cpu很强势，便配置了一个AMD 4650G的ITX机器，用作我自己的服务器。

## 物理服务器安装
我直接选择了 ubuntu20.04.1 版本，通过UltraISO 工具将iso写入SD卡中，然后开启U盘启动，安装ubuntu。
还需要通过 主板 BIOS开启 KVM，通过CPU设置开启 SVM:
如果不开启KVM直接用qemu开启 ubuntu虚拟机，效率比开启KVM虚拟机要慢 50倍左右，这也是我不想用 云服务器的原因。
换用[清华源](https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/)

## 物理服务器安装qemu-ubuntu虚拟机
可以参考文章:[qemu起ubuntu server](https://spyff.github.io/linux/2018/07/20/qemu-vm/)

在云服务器上按着文章成功配置了qemu虚拟机，但是在服务器上一直是失败的，原因就是起了服务器之后一直无法登陆。所以最后我用了桌面版本ubuntu 20.04.1，而不是 ubuntu server。

1. 下载 ubuntu iso
```
wget https://mirrors.tuna.tsinghua.edu.cn/ubuntu-releases/20.04.1/ubuntu-20.04.1-desktop-amd64.iso
mv ubuntu-20.04.1-desktop-amd64.iso ubuntu.iso
```

2. 创建磁盘
```
qemu-img create -q -f qcow2 stable_ubuntu.img 32G
```

3. 安装虚拟机
这一步尽量不要用 ssh做，直接在物理机器上搞比较快，第一次安装需要 -cdrom指定iso文件位置，后面就不需要了。在安装的之后需要指定 用户名密码。
```
安装
sudo qemu-system-x86_64 ubuntu.img -m 1024 -cdrom ubuntu.iso --enable-kvm
```

4. 启动虚拟机
启动虚拟机分为两种:
a. 直接启动原来内核的虚拟机(可以直接联网，下载软件)
也可以ssh链接： ssh -v rlk@127.0.0.1 -p 2222
```
sudo qemu-system-x86_64 \
    -hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img \
    -smp 4 \
    -m 4096 \
    --enable-kvm \
    -net nic \
    -net user,hostfwd=tcp::2222-:22 \
    --nographic \
    -fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none \
    -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share
```

b. 用新kernel代替 stable_ubuntu.img中 的 kernel(替代内核)
```
sudo qemu-system-x86_64 \
    -kernel /home/ubuntu/workspace/share/stable/bzImage \
    -hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img \
    -append "root=/dev/sda5 console=ttyS0" \
    -smp 4 \
    -m 4096 \
    --enable-kvm \
    -net nic \
    -net user,hostfwd=tcp::2222-:22 \
    --nographic \
    -fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none \
    -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share
```

5. 至于开机启动都是 /etc/rc.local 里面配置
https://gitee.com/shshshsh/cloud_server_shell

6. test 相关
a. ltp（linux kernel test project）：linux内核测试 project 编译安装，运行
https://github.com/linux-test-project/ltp


b. mmetst 可以测试 linux kernel 不同版本之间性能差异
https://github.com/gormanm/mmtests
https://lwn.net/Articles/820823/
https://lwn.net/Articles/463339/
https://blog.csdn.net/Linux_Everything/article/details/106485101

c. lkp （linux kernel performance）:是 intel发起的一个kernel performance test项目
https://github.com/fengguang/lkp-
https://01.org/lkp
https://01.org/blogs/jdu1/2017/lkp-tests-linux-kernel-performance-test-and-analysis-tool
https://github.com/sammcj/kernel-ci
http://hejq.me/2014/10/30/lkp-tests-notes/
https://libraries.io/github/openthos/lkp-analysis

7. 学习kvm
https://www.linux-kvm.org/page/Kvmtools
https://blog.csdn.net/leoufung/article/details/48781119
git://git.kernel.org/pub/scm/linux/kernel/git/will/kvmtool.git


## 远程访问本地服务器

由于本地服务器其实是没有固定ip的，所以需要一台固定ip的服务器做中转，
这样才能从任何地方远程访问到我的物理服务器，正好有一个腾讯云服务器，就充当了这个角色。

我使用的是 nps 这个开源代理工具，相比于其他工具来说，配置简单，直接在网页上就可以配置
参考[超好用轻量级NPS内网穿透](https://zhuanlan.zhihu.com/p/102138783)


### NPS问题
1. 稳定性：
这个我其实已经使用了超过1个月了，机器都没重启过，服务都还正常，对于个人使用来说完全足够了

2. 带宽
由于我的腾讯云服务器带宽了 `1Mbps`,其实峰值带宽也就 `128Kb/s`。

我使用服务器主要场景是
```
1. 有编译任务
2. ssh 到服务器
3. vscode ssh 到服务器看代码，写代码
```

其实 1 和 2对 带宽要求都很低，但是 vscode ssh 对于带宽要求还是比较高的，
从腾讯云后台监控数据上看，我的服务器 每次都是 vscode ssh 到腾讯云的时候
或者服务器的时候带宽都用满了，导致有时候ssh需要连 几min 才能连接上。

vscode ssh 在连接上之后对于带宽使用率其实很低，在连接瞬间有较高要求。

我无奈之下就想给 腾讯云的服务搞成按流量计费的，一通操作下来没想到腾讯云居然不支持
活动时候买的服务器改网络配置。。

那就只能升级到2M带宽 或者更高了，升级了一下到 2Mbps,然后再用 vscode shh连接 就很丝滑了，然后我就想能不能通过调整vscode ssh配置来达到这样目的的，发现好像还真有个 timeout 时间，默认 `15s`，我改到了30s，也可能如果不升级带宽,仅仅将配置改到`30s` vscode经常超时的问题就好了呢？

等到5月份之后不续费再继续看看情况。。。
