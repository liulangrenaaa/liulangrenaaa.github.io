---
title: 那些经常忘记的shell命令
date: 2020-09-12 19:00:00
tags:
    - shell
categories:
    - shell脚本
slug: "开发工具/经常忘记的shell命令"
---


总有那么几条经常使用，但有比较难记住的命令，做个记录。

1. ln 创建连接

ln 创建 软链接
```
ln -s   实际文件/目录          软链接文件/目录
ln -s /usr/sbin/trace-bpfcc /usr/bin/trace
```

ln 创建 硬链接
```
ln   实际文件          硬链接文件 //目录无法使用硬链接
ln  /usr/sbin/trace-bpfcc /usr/bin/trace
```



2. tar

解压 tar.gz 文件      // extrat -- 提取
```
tar -zxvf file.tar.gz
```

压缩 文件、文件夹      // create  -- 创建
```
tar -zcvf file.tar.gz  ./file
```


3. zip

zip 解压 aaa.zip文件
```
unzip aaa.zip
```

zip 压缩文件夹
```
zip -r aaa.zip ./aaa
```

zip 压缩多个文件
```
zip -r aaa.zip ./aaa ./bbb
```




4. scp 本地 <--> 远程 互传文件

从 ubuntu@xxx:222 获取 `/home/ubuntu/.vscode-server/data/Machine/settings.json` 文件，且保存为 `/tmp/settings.json`
```
scp -P  222 ubuntu@xxx:/home/ubuntu/.vscode-server/data/Machine/settings.json /tmp/settings.json
```

将本地的 elfutils-0.144.tar.bz2 文件传输到 `ubuntu@xxxx:/home/ubuntu/` 目录下
```
 scp -P  222  ./elfutils-0.144.tar.bz2 ubuntu@xxxx:/home/ubuntu/
```
可以参考[scp 命令介绍](https://www.cnblogs.com/bignode/articles/9241333.html)


这样还是必须输入密码的，可以使用 `sshpass` 来免密码传输
```
sshpass -p hjkl scp -P  222  ./elfutils-0.144.tar.bz2 ubuntu@xxxx:/home/ubuntu/
```


5. ubuntu 截图工具

安装
```
sudo apt-get install flameshot
```

使用
```
flameshot gui
```

```
Inspiron-5548@ubuntu: ~/workspace/linux-stable# cat ~/.zshrc| tail -n 1
alias shot="flameshot gui"
Inspiron-5548@ubuntu: ~/workspace/linux-stable# shot
```





6. 编译linux kernel 前准备工作

```
sudo apt install git fakeroot build-essential ncurses-dev xz-utils libssl-dev bc flex libelf-dev bison clang gcc-aarch64-linux-gnu
```





7. dd 快速生成大文件
```
Inspiron-5548@130ubuntu: ~# dd if=/dev/zero of=haha bs=1M count=100
记录了100+0 的读入
记录了100+0 的写出
104857600 bytes (105 MB, 100 MiB) copied, 0.294862 s, 356 MB/s
Inspiron-5548@ubuntu: ~#
```


8. rsync
为啥我需要 rsync来同步文件目录呢？

我的博客仓库部署在 tencent 上，其实本地公司、家里个人电脑也部署了一份，github gitee 上也备份了。
但是如果依赖手动去同步：
1. 在哪个 linux机器上修改了之后及时发布到github,且及时备份到gitee
2. 到新的机器上修改之前，需要先 `git pull origin master` 将本地，或者服务器上 blog更新到最新
3. 开始修改，修改完成 --> 1

然后我发现我这个场景 rsync 并不能很好解决。。
如果是 一个服务器 和 备份服务器之间 数据同步 可以使用这样的方式。。
突然想到，在新安装一台 linux主机 虚拟机 的时候，可以使用 rsync 来同步，减少 home 目录下文件搞来稿去的 事情。。

远程目录同步到本地
```
rsync -avz  49.235.41.28:/home/ubuntu/workspace/blog_workspace /home/ubuntu/workspace/
```

本地目录同步到远程
```
rsync -avz /home/ubuntu/workspace/  49.235.41.28:/home/ubuntu/workspace/blog_workspace
```

[rsync 命令](http://einverne.github.io/post/2017/07/rsync-introduction.html)


9.  samba 相关

```
net Z: 192.168.1.103???
```

安装配置samba
```
#!/bin/bash
sudo -S apt install samba samba-common-bin -y
echo -e "[samba]\ncomment = samba\npath = /home/ubuntu/workspace\npublic = yes\nwritable = yes\ncreate mask = 0644\ndirectory mask = 0755\nforceuser = ubuntu\nforcegroup = ubuntu" | sudo -i tee -a /etc/samba/smb.conf;
sudo -S systemctl enable smbd
sudo -S service smbd restart
```


10. wine 使用

工作上可能需要使用通讯会议这样的软件，或者是临时使用source insight，但这些又都没有linux版
本，要么使用wine来模拟windows api实现，要么使用windows虚拟机。

这里使用wine:
安装 `wine`
```
sudo apt install wine
sudo apt install winetricks
```

安装 `软件`
```
sudo apt install winetricks
```
进去选择资源管理器，初始化一下~/.wine 目录，然后直接安装

使用 `软件`
```
Inspiron-5548@ubuntu: ~/workspace# tail ~/.zshrc  -n 2
alias shot="flameshot gui"
alias wemeet="wine /home/ubuntu/.wine/drive_c/Program\ Files\ \(x86\)/Tencent/WeMeet/wemeetapp.exe"
Inspiron-5548@ubuntu: ~/workspace# wemeet
```


11. 查询常见函数

apropos

```
Inspiron-5548@ubuntu: ~/workspace/kernel_debug_tools# apropos pid
acpid (8)            - Advanced Configuration and Power Interface event daemon
biosnoop-bpfcc (8)   - Trace block device I/O and print details incl. issuing PID.
getpid (2)           - get process identification
getppid (2)          - get process identification
git (1)              - the stupid content tracker
pid_namespaces (7)   - overview of Linux PID namespaces
pidfd_open (2)       - obtain a file descriptor that refers to a process
pidfd_send_signal (2) - send a signal to a process specified by a file descriptor
pidof (8)            - find the process ID of a running program.
pidpersec-bpfcc (8)  - Count new processes (via fork()). Uses Linux eBPF/bcc.
pidpersec.bt (8)     - Count new processes (via fork()). Uses bpftrace/eBPF.
waitpid (2)          - wait for process to change state
Inspiron-5548@ubuntu: ~/workspace/kernel_debug_tools#
```

12. 查找常见软件包
`sudo apt-cache search `

```
Inspiron-5548@ubuntu: ~/workspace/kernel_debug_tools# sudo apt-cache search qemu | grep arm
qemu-efi-arm - UEFI firmware for 32-bit ARM virtual machines
qemu-system-arm - QEMU full system emulation binaries (arm)
Inspiron-5548@ubuntu: ~/workspace/kernel_debug_tools# sudo apt-cache search qemu | grep aarch64
qemu-efi-aarch64 - UEFI firmware for 64-bit ARM virtual machines
Inspiron-5548@ubuntu: ~/workspace/kernel_debug_tools#
```



13. make 相关
指定 `gcc` version，和 忽略 `warning`.
```
make CC=gcc-7 CFLAGS="-Wno-error"
```

14. ubuntu-21 安装低版本 gcc
在 ubuntu-21 上需要编译 linux-3.4 版本代码，需要安装 gcc-5
但是在ubuntu-21 上，没有提供 gcc-5的官方源，
这时候 可以将 ubuntu-16 的源添加到 `/etc/apt/source.list` 中
```
ubuntu@zeku_server:~/workspace/linux $ sudo apt-cache policy gcc-5
gcc-5:
  已安装：5.4.0-6ubuntu1~16.04.12
  候选： 5.4.0-6ubuntu1~16.04.12
  版本列表：
 *** 5.4.0-6ubuntu1~16.04.12 500
        500 https://mirrors.tuna.tsinghua.edu.cn/ubuntu xenial-updates/main amd64 Packages
        500 https://mirrors.tuna.tsinghua.edu.cn/ubuntu xenial-security/main amd64 Packages
        100 /var/lib/dpkg/status
     5.3.1-14ubuntu2 500
        500 https://mirrors.tuna.tsinghua.edu.cn/ubuntu xenial/main amd64 Packages
ubuntu@zeku_server:~/workspace/linux $
```
参考[Ubuntu高版本如何安装低版本GCC (以Ubuntu 20安装GCC5为例)](https://blog.csdn.net/CharlieVV/article/details/111242143)

15. sed 命令
`sed` `grep` `awk` 被称为linux三剑客，足以说明其强大的字符文本处理能力。
a. 删除 'str1 str2' 的特定行(这个在处理 kernel config文件时候很有用)
```
ubuntu@~: $ cat .config | grep "CONFIG_INLINE_SPIN_UNLOCK_IRQ=y"
CONFIG_INLINE_SPIN_UNLOCK_IRQ=y
ubuntu@~: $
ubuntu@~: $ sed -i '/CONFIG_INLINE_SPIN_UNLOCK_IRQ=y/d' .config
ubuntu@~: $ cat .config | grep "CONFIG_INLINE_SPIN_UNLOCK_IRQ=y"
```

b. l

15. grep 命令
a. 最常见的
```
tencent_clould@1ubuntu: ~/workspace/blog_workspace# grep "asdfasdf" . -nr
./source/file.md:224:asdfasdf_
./source/file.md:239:asdfasdf
tencent_clould@ubuntu: ~/workspace/blog_workspace#
```

b. `-w` 全词匹配
```
tencent_clould@ubuntu: ~/workspace/blog_workspace# grep "asdfasdf" . -nr -w
./source/file.md:239:asdfasdf
tencent_clould@ubuntu: ~/workspace/blog_workspace#
```

c. `-A 3` `-B 3`  `-C 3`
显示前后几行：
加上查找到的后三行  加上查找前三行   加上查找的前后三行

d. 正则表达式
```
grep  -E 'migrate.*a.out|sched_switch.*a.out|sugov_next_freq|START|END'
```


16. awk 命令
在 下面这一段字符串总找出 关键数字。
```
Big task executing for 3s...
Changing to small task...
Time incorrectly scheduled on small when task was big: 80561 usec (2% of big task CPU time)
Time incorrectly scheduled on big when task was small, after downmigration: 53 usec (0% of small task CPU time)
Downmigration latency: 72232 usec
```

awk 将shell中参数传递到 awk表达式中
```
FILE_NAME=/tmp/1234.txt
lines=`awk '{print NR}'  $FILE_NAME | tail -n1`
echo "lines : $lines"

# 循环遍历
for i in $(seq 1 $lines);
do
        val=`awk -v i="$i" 'NR==i {print $1}' $FILE_NAME`
        # awk -v i="$i" 'NR==i {print $1}' $FILE_NAME
        echo "val= $val"
done
```
可以使用 `awk -v i="$i"` 来传参。

awk 传参到shell数组
```
#!/bin/bash

FILE_NAME=/tmp/1234.txt
lines=`awk '{print NR}'  $FILE_NAME | tail -n1`
echo "lines : $lines"

# 循环遍历
for i in $(seq 1 $lines);
do
        val[$i]=`awk -v i="$i" 'NR==i {print $1}' $FILE_NAME`
        # awk -v i="$i" 'NR==i {print $1}' $FILE_NAME
        # echo "val= $val"
done

for i in $(seq 1 $lines);
do
        echo "val[$i]= ${val[$i]}"
done
```


17. inline
linux 代码中会经常使用到 `inline`的技巧，使得少一次函数调用，代码原地展开，
但是有时候 `gcc` 编译器会 '智能'的给我们 inline一些我们不想 inline的函数，所以
有什么部分可以让编译器知道我们不想 inline 某些函数呢？

添加 `noinline` 关键字
```
static void noinline create_oops(void)
{
	*(int *)0 = 0;
}
```

18. mount
重新挂载某一个目录，并改变大小

```
mount -o 128M -o remount /tmp
```


19. ubuntu shell 切换 wifi
切换wifi
```
sudo nmcli connection up Su
sudo nmcli connection up ChinaNet-5mrv
```

连接wifi
```
sudo nmcli dev wifi connect ChinaNet-5mrv password ejgaefpq
```

21. ubuntu cmd 测试网络速度
```
amd_server@130ubuntu: ~/workspace# sudo apt install speedtest-cli
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace# speedtest-cli
Retrieving speedtest.net configuration...
Testing from China Telecom Shanghai (101.228.28.85)...
Retrieving speedtest.net server list...
Selecting best server based on ping...
Hosted by China Telecom (Shanghai) [21.59 km]: 8.567 ms
Testing download speed................................................................................
Download: 19.08 Mbit/s
Testing upload speed......................................................................................................
Upload: 22.78 Mbit/s
```

22. 局域网内部两台ubuntu 之间测网速
两台机器都需要安装`iperf`
```
sudo apt install iperf
```

测速
server
```
amd_server@ubuntu: ~/workspace# iperf -s
------------------------------------------------------------
Server listening on TCP port 5001
TCP window size:  128 KByte (default)
------------------------------------------------------------
```

client
udp测速
```
h@ubuntu:~/rlk$ iperf -u -c 192.168.1.17 -b 1000M
------------------------------------------------------------
Client connecting to 192.168.1.17, UDP port 5001
Sending 1470 byte datagrams, IPG target: 11.22 us (kalman adjust)
UDP buffer size:  208 KByte (default)
------------------------------------------------------------
[  3] local 192.168.47.128 port 42228 connected with 192.168.1.17 port 5001
[  3] WARNING: did not receive ack of last datagram after 10 tries.
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec   584 MBytes   490 Mbits/sec
[  3] Sent 416552 datagrams
sh@ubuntu:~/rlk$
```

tcp测速
```
sh@ubuntu:~/rlk$ iperf  -c 192.168.1.17 -b 1000M
------------------------------------------------------------
Client connecting to 192.168.1.17, TCP port 5001
TCP window size:  204 KByte (default)
------------------------------------------------------------
[  3] local 192.168.47.128 port 46822 connected with 192.168.1.17 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.2 sec  22.8 MBytes  18.7 Mbits/sec
```
明显`tcp` 测速结果比 `udp`测速的慢了好多

23. shell 命令连续执行

`&&` 连续执行多条命令，前面执行成功，后面才能继续执行
```
amd_server@127ubuntu: ~/workspace# ls && echo
benos  data  jenkins_workspace  just_for_git  kernel_debug_tools  linux-stable  mails  nps  share  tmp  vscode

amd_server@ubuntu: ~/workspace# ls asdasd && echo
ls: cannot access 'asdasd': No such file or directory
amd_server@2ubuntu: ~/workspace#
```

`||` 前一条命令执行失败，后面命令才能继续执行
```
amd_server@ubuntu: ~/workspace# ls  || echo "hjkl"
benos  data  jenkins_workspace  just_for_git  kernel_debug_tools  linux-stable  mails  nps  share  tmp  vscode
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace# ls asdasd || echo "hjkl"
ls: cannot access 'asdasd': No such file or directory
hjkl
amd_server@ubuntu: ~/workspace#
```

`;`顺序执行一系列命令，后一个命令不管前一条命令执行是否成功都需要执行
```
amd_server@2ubuntu: ~/workspace# ls asdasd && echo "hjkl"
ls: cannot access 'asdasd': No such file or directory
amd_server@2ubuntu: ~/workspace#
amd_server@2ubuntu: ~/workspace#
amd_server@2ubuntu: ~/workspace# ls asdasd ; echo "hjkl"
ls: cannot access 'asdasd': No such file or directory
hjkl
amd_server@ubuntu: ~/workspace#
```

`&`后台执行
```
amd_server@ubuntu: ~/workspace# ls asdasd &
[1] 75103
amd_server@ubuntu: ~/workspace# ls: cannot access 'asdasd': No such file or directory

[1]  + 75103 exit 2     ls --color=tty asdasd
amd_server@ubuntu: ~/workspace#
```

24. 切换 shell 为 zsh
```
sh@amd_server:~/workspace/diagnose-tools $ cat /etc/shells
# /etc/shells: valid login shells
/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/tmux
/bin/zsh
/usr/bin/zsh
sh@amd_server:~/workspace/diagnose-tools $ chsh -s /bin/zsh
Password:
sh@amd_server:~/workspace/diagnose-tools $
```

安装 o-my-zsh
```
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

24. 生成、应用patch
```
git diff > /tmp/123.patch
git apply /tmp/123.patch
```

```
git format-patch HEAD^
git am 001-xxx.patch
```

25. 解压 vmlinuz 到 vmlinux
```
Inspiron-5548@1ubuntu: /boot# sudo touch vmlinux
Inspiron-5548@ubuntu: /boot# sudo chmod 777 vmlinux
Inspiron-5548@ubuntu: /boot# sudo od -t x1 -A d vmlinuz | grep "1f 8b 08 00"
0016800 8d 80 00 02 00 00 ff e0 1f 8b 08 00 00 00 00 00
^C
Inspiron-5548@130ubuntu: /boot# 0016800+8
zsh: command not found: 0016800+8
Inspiron-5548@127ubuntu: /boot# sudo dd if=vmlinuz bs=1 skip=0016808 | zcat >  vmlinux
记录了9699832+0 的读入
记录了9699832+0 的写出
9699832 bytes (9.7 MB, 9.3 MiB) copied, 19.7819 s, 490 kB/s

gzip: stdin: decompression OK, trailing garbage ignored
Inspiron-5548@2ubuntu: /boot#
```

26. insmod failed

```
stable_kernel@1kernel: /tmp/share/test_modules/resource_leak/kmemleak# sudo insmod kmemleak.ko
[   42.674738] kmemleak: module is already loaded
insmod: ERROR: could not insert module kmemleak.ko: Invalid parameters
stable_kernel@1kernel: /tmp/share/test_modules/resource_leak/kmemleak#
stable_kernel@1kernel: /tmp/share/test_modules/resource_leak/kmemleak# dmesg | tail -n 3
[   33.897197] rfkill: input handler disabled
[   42.674217] kmemleak: loading out-of-tree module taints kernel.
[   42.674738] kmemleak: module is already loaded
```
原因是 kernel 已经安装了一个 `built-in` 的 kmemleak 模块。

27. adb 脚本相关
等待 adb 设备上线
```
adb wait-for-device
```


28. bat脚本相关
延时5s
```
timeout 5
```

29. stress 使用
`stress --help`
```
amd_server@ubuntu: ~/workspace/linux-stable# stress --help
`stress' imposes certain types of compute stress on your system

Usage: stress [OPTION [ARG]] ...
 -?, --help         show this help statement
     --version      show version statement
 -v, --verbose      be verbose
 -q, --quiet        be quiet
 -n, --dry-run      show what would have been done
 -t, --timeout N    timeout after N seconds
     --backoff N    wait factor of N microseconds before work starts
 -c, --cpu N        spawn N workers spinning on sqrt()
 -i, --io N         spawn N workers spinning on sync()
 -m, --vm N         spawn N workers spinning on malloc()/free()
     --vm-bytes B   malloc B bytes per vm worker (default is 256MB)
     --vm-stride B  touch a byte every B bytes (default is 4096)
     --vm-hang N    sleep N secs before free (default none, 0 is inf)
     --vm-keep      redirty memory instead of freeing and reallocating
 -d, --hdd N        spawn N workers spinning on write()/unlink()
     --hdd-bytes B  write B bytes per hdd worker (default is 1GB)

Example: stress --cpu 8 --io 4 --vm 2 --vm-bytes 128M --timeout 10s

Note: Numbers may be suffixed with s,m,h,d,y (time) or B,K,M,G (size).
```

`stress -c 4` -- 对 `cpu` 进行压力测试
`stress -m 2` -- 对 `memory` 进行压力测试，两个进程，每个进程默认占用 `256MB` 内存，一直进行`malloc free`操作，所以cpu也很高
`stress -m 3 --vm-bytes 300M` -- 对 `memory` 进行压力测试，三个进程，每个进程占用 `300MB` 内存，一直进行`malloc free`操作，所以cpu也很高
`stress -m 3 --vm-bytes 300M --vm-hang 3` -- 对 `memory` 进行压力测试，三个进程，每个进程占用 `300MB` 内存，因为hang 住，就是不会一直分配内存，所以cpu占用很少



30. 扩大swap分区
主要是笔记本只有4G内存，开两个vscode之后一直内存回收，swap设置小了之后会触发剧烈的pagein pageout，所以扩大一点。
```
root@ubuntu-Inspiron-5548:/# swapoff -a
root@ubuntu-Inspiron-5548:/#
root@ubuntu-Inspiron-5548:/# sudo dd if=/dev/zero of=swapfile bs=4M count=1024
记录了1024+0 的读入
记录了1024+0 的写出
4294967296 bytes (4.3 GB, 4.0 GiB) copied, 10.1046 s, 425 MB/s
root@ubuntu-Inspiron-5548:/#
root@ubuntu-Inspiron-5548:/# sudo mkswap -f swapfile
正在设置交换空间版本 1，大小 = 4 GiB (4294963200  个字节)
无标签， UUID=78564906-a685-4965-a8b8-e967feb23a0f
root@ubuntu-Inspiron-5548:/# swap
swapin.bt  swaplabel  swapoff    swapon
root@ubuntu-Inspiron-5548:/# swapo
swapoff  swapon
root@ubuntu-Inspiron-5548:/# swapon
root@ubuntu-Inspiron-5548:/# swapon -a
root@ubuntu-Inspiron-5548:/#
```

31. 查看 线程优先级
```
amd_server@130ubuntu: ~/workspace/share/test_modules/scheduler/userspace api/nice# ./a.out 20
now nice is 20, ret = 19
^C
amd_server@130ubuntu: ~/workspace/share/test_modules/scheduler/userspace api/nice# ./a.out 0
now nice is 0, ret = 0
amd_server@130ubuntu: ~/workspace/share/test_modules/scheduler/userspace api/nice# sudo ./a.out -12
now nice is -12, ret = -12
^C
amd_server@130ubuntu: ~/workspace/share/test_modules/scheduler/userspace api/nice#
```

```
amd_server@ubuntu: ~/workspace# ps -el  | grep a.out
0 S  1000 1760035 1690956  0  99  19 -   625 hrtime pts/4    00:00:00 a.out
amd_server@ubuntu: ~/workspace# ps -el  | grep a.out
0 S  1000 1760082 1690956  0  80   0 -   625 hrtime pts/4    00:00:00 a.out
amd_server@ubuntu: ~/workspace# ps -el  | grep a.out
4 S     0 1761864 1761863  0  68 -12 -   624 -      pts/4    00:00:00 a.out
amd_server@ubuntu: ~/workspace#
```

只有 root 用户才可以使用 -x 的 nice值。
参考[Linux C语言库函数参考 — nice](https://www.cnblogs.com/cute/archive/2011/11/08/2241258.html)
参考[a.out 代码]()


32. 改变运行中线程的优先级
先 `sleep`
```
amd_server@130ubuntu: ~/workspace/share/test_modules/scheduler/userspace api# sleep 100
amd_server@ubuntu: ~/workspace/share/test_modules/scheduler/userspace api#
```

使用 renice 改变线程优先级
```
amd_server@ubuntu: ~/workspace# ps -el  | grep sleep
0 S  1000 1763468 1206623  0  80   0 -  2790 hrtime ?        00:00:00 sleep
0 S  1000 1763647 1690956  0  80   0 -  2791 hrtime pts/4    00:00:00 sleep
amd_server@1ubuntu: ~/workspace# renice -n 13 -p 2791
amd_server@130ubuntu: ~/workspace# ps -aux  | grep sleep
ubuntu   1763468  0.0  0.0  11160   520 ?        S    18:11   0:00 sleep 180
ubuntu   1763647  0.0  0.0  11164   588 pts/4    S+   18:12   0:00 sleep 100
ubuntu   1763805  0.0  0.0  12120   728 pts/5    S+   18:13   0:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox sleep
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace# renice -n 13 -p 1763647
1763647 (process ID) old priority 0, new priority 13
amd_server@ubuntu: ~/workspace# ps -aux  | grep sleep
ubuntu   1763468  0.0  0.0  11160   520 ?        S    18:11   0:00 sleep 180
ubuntu   1763647  0.0  0.0  11164   588 pts/4    SN+  18:12   0:00 sleep 100
ubuntu   1763883  0.0  0.0  12120   660 pts/5    S+   18:14   0:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox sleep
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace#
amd_server@ubuntu: ~/workspace# ps -el  | grep sleep
0 S  1000 1763468 1206623  0  80   0 -  2790 hrtime ?        00:00:00 sleep
0 S  1000 1763647 1690956  0  93  13 -  2791 hrtime pts/4    00:00:00 sleep
amd_server@ubuntu: ~/workspace#

```

33. 一行循环执行某个命令

```
for i in $(seq 1 20000); do   ; done
for i in $(seq 1 20000); do cat /proc/28703/sched | grep effective ; done

for i in $(seq 1 20000); do echo $i; done

```

34. 快速git clone 大项目

```
git clone git://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git --depth 1
```

```
for i in $(seq 1 200); do echo $i; done
```

然后 `git fetch --unshallow` 整个项目即可

clone 指定分支
```
git clone https://android.googlesource.com/kernel/common -b android13-5.15-2022-11
```

35. tuna 开源 mirror的linux仓库地址
```
mainline: git clone https://mirrors.tuna.tsinghua.edu.cn/git/linux.git
stable:   git clone https://mirrors.tuna.tsinghua.edu.cn/git/linux-stable.git
next:     git clone https://mirrors.tuna.tsinghua.edu.cn/git/linux-next.git
```

kernel.org官方源
```
amd_server@ubuntu: ~/workspace/stable# git remote -vv
kernel  git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git (fetch)
kernel  git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git (push)
stable  git://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git (fetch)
stable  git://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git (push)
```


36. 如何快速 clone 一个较大仓库
```
git clone --depth=1 xxx
git fetch --unshallow
```

37. vim 安装插件
```
:PlugInstall
```


38. 查看线程调度策略
```
ps -eLfc | grep FF
ps -eLfc | grep RR
```

具体定义如下
```
class scheduling class of the process.  (alias policy, cls).  Field's possible values are:
    -   not reported
    TS  SCHED_OTHER
    FF  SCHED_FIFO
    RR  SCHED_RR
    B   SCHED_BATCH
    ISO SCHED_ISO
    IDL SCHED_IDLE
    DLN SCHED_DEADLINE
    ?   unknown value
```


39. 给cpu定频率
```
cpufreq-set:
DESCRIPTION
cpufreq-set allows you to modify cpufreq settings without having to type e.g. "/sys/devices/system/cpu/cpu0/cpufreq/scaling_set_speed" all the time.

OPTIONS
-c --cpu <CPU>
number of CPU where cpufreq settings shall be modified.
-d --min <FREQ>
new minimum CPU frequency the governor may select.
-u --max <FREQ>
new maximum CPU frequency the governor may select.
-g --governor <GOV>
new cpufreq governor.
-f --freq <FREQ>
specific frequency to be set. Requires userspace governor to be available and loaded.
-h --help
Prints out the help screen.
```

40. git log
`git log` 十分强大，目前一个工作是查看 Q & M的 kernel代码改了那些东西，用起来这个更是十分有必要
```
1. git log -S

2. git log -L :func_name:file
git log -L :select_task_rq:kernel/sched/core.c

3. git log -Lline_num:file
git log -L2825,+2:kernel/sched/core.c

4. git log master..feature : 包含在 feature分支，但是不在master分支上的patch
5. git log --no-merges : 过滤掉merge的patch
6. git log commit1 commit2 : commit1--commit2之间的patch
```

我需要监控 两个commit之间的patch，但是我只关注 `kernel/sched/` 目录下文件的修改，改如何将这些commits找出来？
这里我写了一个[python脚本](https://gitee.com/shshshsh/find_releated_commits)来实现。


41. git branch
a. 检查哪些分支包含某个 `commit id`
```
ubuntu@zeku_server:~/workspace/msm-5.4 $ git branch -a --contains f556cd74a7ea038c67812b0d9b5d971d03da5372
  msm-5.4.r5
  remotes/origin/LA.AU.0.2.0.r4.1
  remotes/origin/LV.AU.0.2.0.r1
  remotes/origin/kernel.lnx.5.4.r1-rel
  remotes/origin/kernel.lnx.5.4.r3-rel
  remotes/origin/kernel.lnx.5.4.r6-rel
  remotes/origin/kernel.lnx.5.4.r7-rel
  remotes/origin/kernel.lnx.5.4.r9-rel
  remotes/origin/msm-5.4.r2
  remotes/origin/msm-5.4.r5
ubuntu@zeku_server:~/workspace/msm-5.4 $ git branch -r --contains f556cd74a7ea038c67812b0d9b5d971d03da5372
  origin/LA.AU.0.2.0.r4.1
  origin/LV.AU.0.2.0.r1
  origin/kernel.lnx.5.4.r1-rel
  origin/kernel.lnx.5.4.r3-rel
  origin/kernel.lnx.5.4.r6-rel
  origin/kernel.lnx.5.4.r7-rel
  origin/kernel.lnx.5.4.r9-rel
  origin/msm-5.4.r2
  origin/msm-5.4.r5
ubuntu@zeku_server:~/workspace/msm-5.4 $ git branch  --contains f556cd74a7ea038c67812b0d9b5d971d03da5372
  msm-5.4.r5
ubuntu@zeku_server:~/workspace/msm-5.4 $ git branch msm-5.4.r5  --contains f556cd74a7ea038c67812b0d9b5d971d03da5372
  msm-5.4.r5
ubuntu@zeku_server:~/workspace/msm-5.4 $ git branch android11-5.4  --contains f556cd74a7ea038c67812b0d9b5d971d03da5372
ubuntu@zeku_server:~/workspace/msm-5.4 $
```



42.  git show
a. 查看某个 commit是哪个版本引入的
```
ubuntu@zeku_server:~/workspace/linux $ git show e6223a3b19421e3a8df1352d21fd0d71093f44ae:Makefile
VERSION = 2
PATCHLEVEL = 6
SUBLEVEL = 36
EXTRAVERSION =
NAME = Flesh-Eating Bats with Fangs
```

43.   随机提取一个commit来生成patch
```
git format-patch HEAD^ : 生成patch
git format-patch -1 commit-id : 生成这个 commit-id 的patch。
```

44. gcc -E预编译 .c文件
45. gcc 生成汇编 文件
```
gcc -S 123.c
```

46. gcc 生成 汇编和 C文件 对照
```
gcc -Wa,-adlhn 123.c
```

47. 检查commits是否有`Functional change`
```
add helper func for util_avg and runnable_avg calc when entity
enqueue and dequeue. No functional change.

without this change:
size vmlinux
   text	   data	    bss	    dec	    hex	filename
19889268	6632812	2429160	28951240	1b9c2c8	vmlinux
size kernel/sched/fair.o
   text	   data	    bss	    dec	    hex	filename
  40044	   1569	     96	  41709	   a2ed	kernel/sched/fair.o
ubuntu@zeku_server:~/workspace/linux-stable $

with this change:
size vmlinux
   text	   data	    bss	    dec	    hex	filename
19889268	6632812	2429160	28951240	1b9c2c8	vmlinux
size kernel/sched/fair.o
   text	   data	    bss	    dec	    hex	filename
  40044	   1569	     96	  41709	   a2ed	kernel/sched/fair.o
```
参考[lkml 邮件](https://lkml.org/lkml/2021/4/22/297)


1.  编译出现`error, forbidden warning:` 编译错误
```
两种解决办法
这是因为编译的时候,由于你的代码不符合标准,比如类型转换的时候,你没有强制转化(比如将int型赋值给char型,需要强制转换)或者定义了某些变量或者函数却没有使用.这些都会出现警告,而警告将会被看做错误来处理.
1. 修改自己的代码,将出现的警告全部解决掉.该强制转换的强制转化,该删掉定义了未使用的变量函数删掉或者注释掉.
2. 修改scripts/gcc-wrapper.py将interpret_warning(line)注释掉,这样它就不会将警告当成错误处理了
```

46. qemu 邮件列表 `qemu-discuss@nongnu.org`
```
KVM开发者邮件列表是：kvm@vger.kernel.org
KVM内核部分以及QEMU中与KVM相关部分的讨论都会在这里讨论。
订阅方法：向majordomo@vger.kernel.org发送一封以”subscribe kvm”为正文的邮件。

QEMU开发者邮件列表是：qemu-devel@nongnu.org
QEMU普通用户讨论的邮件列表是：qemu-discuss@nongnu.org

KVM的IRC频道：在irc.freenode.net服务器上的#kvm频道

QEMU的IRC频道：在irc.oftc.net服务器上的#qemu频道
```

47. android ltp 编译 test eas.

动态编译
```
./configure CC=aarch64-linux-gnu-gcc --build=x86_64-pc-linux-gnu --target=aarch64-linux --host=aarch64-linux

make -j10
```


然后静态编译
```
aarch64-linux-gnu-gcc -static -g -O2 -fno-strict-aliasing -pipe -Wall -W -Wold-style-definition  -I../../../../include -I../../../../include -I../../../../include/old/  -c -o eas_big_to_small.o eas_big_to_small.c


aarch64-linux-gnu-gcc -static  -L../../../../lib  eas_big_to_small.o trace_parse.o util.o   -lltp -lpthread -o eas_big_to_small
```


48. sched_feat 怎么动态修改？
a. 直接在板子上修改文件节点，只对当前测试有效 `/sys/kernel/debug/sched_features`，
```
venus:/data/local/tmp/eas # cat /sys/kernel/debug/sched_features
GENTLE_FAIR_SLEEPERS START_DEBIT NO_NEXT_BUDDY LAST_BUDDY CACHE_HOT_BUDDY WAKEUP_PREEMPTION NO_HRTICK NO_DOUBLE_TICK NONTASK_CAPACITY NO_TTWU_QUEUE NO_SIS_AVG_CPU S
IS_PROP NO_WARN_DOUBLE_CLOCK RT_PUSH_IPI RT_RUNTIME_SHARE NO_LB_MIN ATTACH_AGE_LOAD WA_IDLE WA_WEIGHT WA_BIAS NO_UTIL_EST NO_SUGOV_RT_MAX_FREQ
venus:/data/local/tmp/eas #
venus:/data/local/tmp/eas #
venus:/data/local/tmp/eas # echo UTIL_EST > /sys/kernel/debug/sched_features
venus:/data/local/tmp/eas #
venus:/data/local/tmp/eas #
venus:/data/local/tmp/eas # cat /sys/kernel/debug/sched_features
GENTLE_FAIR_SLEEPERS START_DEBIT NO_NEXT_BUDDY LAST_BUDDY CACHE_HOT_BUDDY WAKEUP_PREEMPTION NO_HRTICK NO_DOUBLE_TICK NONTASK_CAPACITY NO_TTWU_QUEUE NO_SIS_AVG_CPU S
IS_PROP NO_WARN_DOUBLE_CLOCK RT_PUSH_IPI RT_RUNTIME_SHARE NO_LB_MIN ATTACH_AGE_LOAD WA_IDLE WA_WEIGHT WA_BIAS UTIL_EST NO_SUGOV_RT_MAX_FREQ
venus:/data/local/tmp/eas #
venus:/data/local/tmp/eas #
```

b. 直接修改源文件，这样编译生效
直接修改 `kernel/sched/features.h` 文件中的 true or false。
```
SCHED_FEAT(RT_RUNTIME_SHARE, true)
SCHED_FEAT(LB_MIN, false)
SCHED_FEAT(ATTACH_AGE_LOAD, true)

SCHED_FEAT(WA_IDLE, true)
SCHED_FEAT(WA_WEIGHT, true)
SCHED_FEAT(WA_BIAS, true)

/*
 * UtilEstimation. Use estimated CPU utilization.
 */
SCHED_FEAT(UTIL_EST, true)
```



50. shell 参数个数
```
if [ $# -eq 0 ];then
     echo "zero param..."
elif [ $# -eq 1 ];then
     echo "one param..."
else
     echo "more than one param..."
fi
```

51. shell 参数值比较
```
if [ "$1" == "start" ];then   
     echo "do start"
elif [ "$1" == "stop" ];then
     echo "do stop"
else
     echo "Please make sure the positon variable is start or stop."
fi
```


52. shell 捕获 `Ctrl + C`
```
#!/bin/bash

trap 'onCtrlC' INT
function onCtrlC () {
    echo 'Ctrl+C is captured'
    exit 0
}

while true; do
    echo 'I am working!'
     sleep 10
done
```


53.  systrace 支持
抓取到 systrace之后，还需要直观的显示出来，可以在 `https://ui.perfetto.dev/#!/` 看到，[点击跳转](https://ui.perfetto.dev/#!/)


54. offline 某个 cpu

```
ubuntu@ubuntu:/sys/devices/system/cpu/cpu0$ cat /sys/devices/system/cpu/cpu0/online
1
ubuntu@ubuntu:/sys/devices/system/cpu/cpu0$ cat /sys/devices/system/cpu/online
0-3
ubuntu@ubuntu:/sys/devices/system/cpu/cpu0$ cat /sys/devices/system/cpu/offline

ubuntu@ubuntu:/sys/devices/system/cpu/cpu0$ sudo su
root@ubuntu:/sys/devices/system/cpu/cpu0# echo 0 >> /sys/devices/system/cpu/cpu0/online
root@ubuntu:/sys/devices/system/cpu/cpu0# cat  /sys/devices/system/cpu/cpu0/online
0
root@ubuntu:/sys/devices/system/cpu/cpu0# cat echo 0 >> /sys/devices/system/cpu/online
bash: /sys/devices/system/cpu/online: Permission denied
root@ubuntu:/sys/devices/system/cpu/cpu0# cat /sys/devices/system/cpu/online
1-3
root@ubuntu:/sys/devices/system/cpu/cpu0# cat /sys/devices/system/cpu/offline
0
root@ubuntu:/sys/devices/system/cpu/cpu0#
```

55. wsl2 限制内存, cpu使用
文件位置 `D:\Users\50001309`
```
ubuntu@wsl:/mnt/d/Users/50001309 $ cat .wslconfig
[wsl2]
processors=3
memory=3GB
swap=3GB
localhostForwarding=true
ubuntu@wsl:/mnt/d/Users/50001309 $
```

57. vscode remote-ssh 频繁断开原因
win10 自带 openssh 与 vscode不兼容，需要修改环境变量，直接使用 git自带的ssh.
```
https://blog.csdn.net/jyhongjax/article/details/106075493#fromHistory
```


58. 解压 `patch.gz`
a. 删除源文件，得到解压后的文件
```
ubuntu@zeku_server:~/workspace/linux/tmp_out $
ubuntu@zeku_server:~/workspace/linux/tmp_out $ ls
include  Makefile  patch-5.12-rc3-rt3.patch.gz  scripts  source
ubuntu@zeku_server:~/workspace/linux/tmp_out $ gunzip -d patch-5.12-rc3-rt3.patch.gz
ubuntu@zeku_server:~/workspace/linux/tmp_out $ ls
include  Makefile  patch-5.12-rc3-rt3.patch  scripts  source
ubuntu@zeku_server:~/workspace/linux/tmp_out $
```

b. 保留源文件，得到解压后的文件
```
ubuntu@zeku_server:~/workspace/linux/tmp_out $ gunzip -cd patch-5.12-rc3-rt3.patch.gz > patch.txt
ubuntu@zeku_server:~/workspace/linux/tmp_out $
```


59. 解压 `patches.xx.tar.gz`
a. 解压
```
ubuntu@zeku_server:~/workspace/linux/tmp_out $ ls
include  Makefile  patches-5.12-rc3-rt3.tar.gz  scripts  source
ubuntu@zeku_server:~/workspace/linux/tmp_out $ tar -zxvf patches-5.12-rc3-rt3.tar.gz
patches/
patches/0001-kthread-Move-prio-affinite-change-into-the-newly-cre.patch
patches/0001-locking-rtmutex-Remove-cruft.patch
patches/0001-mm-sl-au-b-Change-list_lock-to-raw_spinlock_t.patch
...
ubuntu@zeku_server:~/workspace/linux/tmp_out $ ls patches/
 0001-kthread-Move-prio-affinite-change-into-the-newly-cre.patch   0019-tick-sched-Prevent-false-positive-softirq-pending-wa.patch         mm-memcontrol-Disable-preemption-in-__mod_memcg_lruv.patch
 0001-locking-rtmutex-Remove-cruft.patch                           0020-kdb-only-use-atomic-consoles-for-output-mirroring.patch            mm-memcontrol-do_not_disable_irq.patch
```

b. 使用
```

```


60. 给 kernel 打上 `rt patch`
```
ubuntu@zeku_server:~/workspace/linux/tmp_out $ wget http://cdn.kernel.org/pub/linux/kernel/projects/rt/5.12/patch-5.12-rc3-rt3.patch.gz
--2021-05-25 10:24:37--  http://cdn.kernel.org/pub/linux/kernel/projects/rt/5.12/patch-5.12-rc3-rt3.patch.gz
Resolving cdn.kernel.org (cdn.kernel.org)... 151.101.1.176, 151.101.129.176, 151.101.65.176, ...
Connecting to cdn.kernel.org (cdn.kernel.org)|151.101.1.176|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 135397 (132K) [application/x-gzip]
Saving to: ‘patch-5.12-rc3-rt3.patch.gz’

patch-5.12-rc3-rt3.patch.gz                        100%[===============================================================================================================>] 132.22K   384KB/s    in 0.3s

2021-05-25 10:24:38 (384 KB/s) - ‘patch-5.12-rc3-rt3.patch.gz’ saved [135397/135397]

ubuntu@zeku_server:~/workspace/linux/tmp_out $ gunzip -d patch-5.12-rc3-rt3.patch.gz
ubuntu@zeku_server:~/workspace/linux/tmp_out $ ls
include  Makefile  patch-5.12-rc3-rt3.patch  scripts  source
ubuntu@zeku_server:~/workspace/linux/tmp_out $
ubuntu@zeku_server:~/workspace/linux/tmp_out $ cd ..
ubuntu@zeku_server:~/workspace/linux $ patch -p1 < ./tmp_out/patch-5.12-rc3-rt3.patch
patching file arch/alpha/include/asm/spinlock_types.h
patching file arch/arm/Kconfig
patching file arch/arm/include/asm/spinlock_types.h
patching file arch/arm/include/asm/thread_info.h
patching file arch/arm/kernel/asm-offsets.c
patching file arch/arm/kernel/entry-armv.S
patching file arch/arm/kernel/signal.c
......
ubuntu@zeku_server:~/workspace/linux $ git st
On branch 5.12-rc3
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   arch/alpha/include/asm/spinlock_types.h
	modified:   arch/arm/Kconfig
	modified:   arch/arm/include/asm/spinlock_types.h
	modified:   arch/arm/include/asm/thread_info.h
	modified:   arch/arm/kernel/asm-offsets.c
	modified:   arch/arm/kernel/entry-armv.S
	modified:   arch/arm/kernel/signal.c
```

61. MIPS DMIPS MFLOPS
MIPS: `Million Instructions Per Second`，每秒处理的百万级的机器语言指令数。
DMIPS：`Dhrystone Million Instructions Per Second`，整数运算测试程序 每秒处理的百万级的机器语言指令数
MFLOPS：`A benchmark which attemps to estimate a system's floating-point "MFLOPS" rating for specific FADD, FSUB, FMUL and FDIV instruction mixes.`，是一种基于浮点运算的CPU测试程序，当然，这种测试的结果也以 MFLOPS来加以表示，代表了CPU处理浮点运算的能力。


62. jenkins 升级
tuna mirror
```
https://mirrors.tuna.tsinghua.edu.cn/jenkins/war-stable/2.277.4/jenkins.war
```

如何升级
```
下载提示的 jenkins.war 包，上传到服务器
查看 jenkins.war 的目录，比如是：/usr/share/jenkins/jenkins.war，可用如下命令查看：

ps aux | grep jenkins
备份初始的 jenkins.war 包：cp /usr/share/jenkins/jenkins.war jenkins.war.bak
停止服务：/etc/init.d/jenkins stop
替换新的 war 包后，启动服务：/etc/init.d/jenkins start
```

63. 各种版本 gcc 下载
wget 相应地址
```
https://ftp.gnu.org/gnu/gcc/gcc-4.8.5/
```

64. linux 源文件编译成为 汇编文件

```
make kernel/sched/core.lst V=1
```

```
(base) ubuntu@zeku_server:~/workspace/linux $ ls kernel/sched/core.lst
kernel/sched/core.lst
```

65. 公司服务器安装 软件
一般公司服务器都会预装很多软件，需要使用的时候只需要 module load即可

```
module load vs_code
module unload vs_code
module av
```


66. Ubuntu启用Cgroups V2
首先确定 当前系统是默认启用的是 cgroup v1 还是 v2，
可以通过 `/sys/fs/cgroup/cgroup.controllers` 文件确认，
```
ubuntu@zeku_server:~ $ cat /sys/fs/cgroup/cgroup.controllers
cat: /sys/fs/cgroup/cgroup.controllers: 没有那个文件或目录
```
说明 此时还是 cgroup v1

可以更新 grub文件，在启动的时候 给 kernel 传参，使得默认使用 cgroup v2。
在`/etc/default/grub` 文件中，在 `GRUB_CMDLINE_LINUX` 中
添加 `systemd.unified_cgroup_hierarchy=1`；
然后`sudo update-grub` 更新 grub文件，reboot之后，系统将默认使用 cgroup v2.
```
ubuntu@zeku_server:~ $ cat /sys/fs/cgroup/cgroup.controllers
cpuset cpu io memory pids rdma
```
这是系统默认使用 cgroup v2的样子

也可以通过`mount` 看：
```
ubuntu@zeku_server:~ $ mount | grep cgroup
cgroup2 on /sys/fs/cgroup type cgroup2 (rw,nosuid,nodev,noexec,relatime,nsdelegate)
ubuntu@zeku_server:~ $
```

其中
GRUB_CMDLINE_LINUX_DEFAULT 仅在正常引导时才有效（恢复模式不适用）
GRUB_CMDLINE_LINUX 总是有效的

67.  ubuntu 升级
查看当前版本
```
ubuntu@zeku_server:/etc $ lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 20.10
Release:	20.10
Codename:	groovy
ubuntu@zeku_server:/etc $ uname -a
Linux ubuntu-HP-ProDesk-680-G4-MT 5.8.0-59-generic #66-Ubuntu SMP Thu Jun 17 00:46:01 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
ubuntu@zeku_server:/etc $ sudo do-release-upgrade
正在检查新版 Ubuntu
请在升级前安装您的发行版所有可用更新。
ubuntu@zeku_server:/etc $
```

如果想升级到非lts版本，需要修改 `lts` 到 `normal`
```
sudo sed -i 's/lts/normal/g' /etc/update-manager/release-upgrades
```

最后执行升级即可
```
sudo do-release-upgrade
```

升级成功之后查看
```
ubuntu@zeku_server:~ $  lsb_release -a
No LSB modules are available.
Distributor ID:	Ubuntu
Description:	Ubuntu 21.04
Release:	21.04
Codename:	hirsute
ubuntu@zeku_server:~ $ uname -a
Linux ubuntu-HP-ProDesk-680-G4-MT 5.11.0-22-generic #23-Ubuntu SMP Thu Jun 17 00:34:23 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
ubuntu@zeku_server:~ $
ubuntu@zeku_server:~ $ sudo do-release-upgrade
正在检查新版 Ubuntu
There is no development version of an LTS available.
To upgrade to the latest non-LTS development release
set Prompt=normal in /etc/update-manager/release-upgrades.
ubuntu@zeku_server:~ $
```

强制升级
```
sudo do-release-upgrade -d
```

68.  删除多余 ubuntu old kernel image
```
1973  sudo dpkg --get-selections |grep linux
1974  sudo dpkg --purge linux-image-5.4.0-77-generic
1975  sudo dpkg --purge linux-modules-extra-5.4.0-77-generic
1976  sudo dpkg --purge linux-image-5.4.0-77-generic
1977  sudo dpkg --purge linux-image-5.8.0-59-generic
1978  sudo dpkg --purge linux-modules-extra-5.8.0-59-generic
1979  sudo dpkg --purge linux-image-5.8.0-59-generic
```

69.  linux selftests怎么运行？
编译
```
make -C tools/testing/selftests
```

运行所有测试项
```
make -C tools/testing/selftests run_tests
```

运行单个测试项
```
make -C tools/testing/selftests TARGETS=ptrace run_test
```
参考[Linux Kernel Selftests](https://blog.csdn.net/qq_22418329/article/details/109514029)
参考[Doc文档](https://www.kernel.org/doc/html/latest/dev-tools/kselftest.html)

70. ubuntu bootchart 安装使用
安装
```
sudo apt install systemd-bootchart
```

使用 需要在 kernel 启动参数加上 `init=/lib/systemd/systemd-bootchart`，然后在`/run/log` 目录下，每次启动会生成一张 svg 的矢量图，可以分析出 boot阶段 cpu, io 的使用情况，酌情优化。
```
stable_kernel@kernel: /run/log# pwd
/run/log
stable_kernel@kernel: /run/log# ls
bootchart-20210721-1917.svg  journal
stable_kernel@kernel: /run/log#
```

参考[ARCH-LINUX-WIKI-Improving performance/Boot process](https://wiki.archlinux.org/title/Improving_performance/Boot_process#Analyzing_the_boot_process)

71.  ubuntu 配置 smba 服务器
+ server
安装软件包
```
sudo apt-get install samba smbclient cifs-utils
```
`sudo vim /etc/samba/smb.conf`
在global下的workgroup=WORKGROUP下面添加一句：
`security = user`
最后一行添加：
```
[zeku_smba]
   comment = sharefolder
   path = /tmp/server
   valid users = zeku_smba
   browseable = yes
   read only = yes
   create mask = 0777
   directory mask = 0777
   public = yes
   writable = yes
   available = yes
```

+ client
wsl 上 安装 软件包
```
sudo apt-get install smbclient cifs-utils
```
挂载 目录
```
sudo mount -t cifs -o username=zeku_smba //10.122.7.199/zeku_smba /tmp/server/
```

72.  _GNU_SOURCE
_GNU_SOURCE 有两种使用方法
+ 在包含头文件前 加上 `#define _GNU_SOURCE`
+ 在链接编译的时候，加上`-D_GNU_SOURCE` 选项
这样会降低可移植性

参考[_GNU_SOURCE有啥用](https://stackoverflow.com/questions/5582211/what-does-define-gnu-source-imply)


73.  ubuntu sudo 免密码
+ sudo chmod 744 /etc/sudoers
+ sudo vi /etc/sudoers, 最后一行添加 `rlk ALL=(ALL) NOPASSWD:ALL`
+ sudo chmod 400 /etc/sudoers, 然后即刻生效

74. a
75. a
76. a
77. a vmbox 虚拟机？






77.  linux发行版本如何选择？
```
个人使用的话，
有信仰选 Debian，
追求新特性选 Fedora，
爱好瞎折腾 arch 、gentoo，
新手 Ubuntu，
想用 Windows 软件 deepin，
喜欢 kde 界面、或想在命令行下用 gui 配置选 suse，
安全 Linux 小白选 kali，
你问我 CentOS 怎样？它早该进坟墓了，倒是 CentOS stream 还凑合
```
参考[V2EX](https://www.v2ex.com/t/734996)
安装 fedora 33发现已经是 5.10.22了，果然是与mainline最近的版本。




1.   手动编译安装qemu

发现卸载qemu-system-aarch64，然后重新安装，就已经支持了 raspi4了，可能是 ubuntu官方源自己适配的吧。。
`ubuntu  安装  qemu-system`
```
sudo apt install qemu-system
```

`ubuntu  卸载  qemu-system`
```
sudo apt auto-remove qemu-system
```

`手动编译安装 qemu`
```
1. sudo apt-get install git libglib2.0-dev libfdt-dev libpixman-1-dev zlib1g-dev
2. sudo apt install ninja-build
3. ./configure --target-list=aarch64-softmmu --enable-debug-info --enable-trace-backends=simple --prefix=/usr/local
4. make -j4
5. make install
```
vscode qemu 调试 raspi4b 参考
https://blog.csdn.net/qq_17593855/article/details/134699186

98. linux下pdf阅读器
```
1. chorme 直接打开
2. ubuntu自带的
3. FoxitReader
4. wps
```


99. ubuntu cmd 更新 vscode
方法一:
```
wget https://vscode-update.azurewebsites.net/latest/linux-deb-x64/stable -O /tmp/code_latest_amd64.deb

sudo dpkg -i /tmp/code_latest_amd64.deb
```

方法二:
```
sudo apt update
sudo apt install code
```
会自动下载最新版本 code，然后解压覆盖掉老版本，避免每次手动从网页端下载。


100. shell 脚本检查
+ 安装
```
sudo apt install shellcheck
```

+ 检查
```
shellcheck yourscript
```

代码参考[github](https://github.com/koalaman/shellcheck)
使用参考[博客](https://www.cnblogs.com/zqb-all/p/10054594.html)

101. 控制 `/var/log/journal` 目录大小
```
journalctl --vacuum-size=100M
```

102. `/var/log/btmp` 文件太大
参考[btmp](https://serverfault.com/questions/119299/my-var-log-btmp-file-is-huge-what-should-i-do)
This means people are trying to brute-force your passwords (common on any public-facing server).
就是有人在尝试暴力破解你的机器密码，
Linux用户登录信息放在三个文件中：

+ /var/run/utmp：记录当前正在登录系统的用户信息，默认由who和w记录当前登录用户的信息，uptime记录系统启动时间；
+ /var/log/wtmp：记录当前正在登录和历史登录系统的用户信息，默认由last命令查看；
+ /var/log/btmp：记录失败的登录尝试信息，默认由lastb命令查看。


103. jenkins 启动失败
jenkins 自身运行的log存放在 `/var/log/jenkins` 中
可以查看其中log，来确定具体什么原因
其中有个原因是 8080 端口被其他进程占用了
```
2022-01-07 08:37:26.217+0000 [id=1]     SEVERE  winstone.Logger#logInternal: Container startup failed
java.net.BindException: Address already in use
        at sun.nio.ch.Net.bind0(Native Method)
        at sun.nio.ch.Net.bind(Net.java:461)
        at sun.nio.ch.Net.bind(Net.java:453)
        at sun.nio.ch.ServerSocketChannelImpl.bind(ServerSocketChannelImpl.java:222)
        at sun.nio.ch.ServerSocketAdaptor.bind(ServerSocketAdaptor.java:85)
        at org.eclipse.jetty.server.ServerConnector.openAcceptChannel(ServerConnector.java:345)
Caused: java.io.IOException: Failed to bind to 0.0.0.0/0.0.0.0:8080
        at org.eclipse.jetty.server.ServerConnector.openAcceptChannel(ServerConnector.java:349)
        at org.eclipse.jetty.server.ServerConnector.open(ServerConnector.java:310)
        at org.eclipse.jetty.server.AbstractNetworkConnector.doStart(AbstractNetworkConnector.java:80)
        at org.eclipse.jetty.server.ServerConnector.doStart(ServerConnector.java:234)
        at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:72)
        at org.eclipse.jetty.server.Server.doStart(Server.java:386)
        at org.eclipse.jetty.util.component.AbstractLifeCycle.start(AbstractLifeCycle.java:72)
        at winstone.Launcher.<init>(Launcher.java:182)
Caused: java.io.IOException: Failed to start Jetty
        at winstone.Launcher.<init>(Launcher.java:184)
        at winstone.Launcher.main(Launcher.java:355)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at Main._main(Main.java:375)
        at Main.main(Main.java:151)

```


查看是哪个进程将 端口占用了
```
VM-0-11-ubuntu# netstat -tnlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 127.0.0.1:43265         0.0.0.0:*               LISTEN      2595/node
tcp        0      0 0.0.0.0:111             0.0.0.0:*               LISTEN      1/init
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      985/nginx: master p
tcp        0      0 0.0.0.0:6000            0.0.0.0:*               LISTEN      944/sshd: /usr/sbin
tcp        0      0 192.168.122.1:53        0.0.0.0:*               LISTEN      1712/dnsmasq
tcp        0      0 10.0.3.1:53             0.0.0.0:*               LISTEN      1111/dnsmasq
tcp        0      0 0.0.0.0:21              0.0.0.0:*               LISTEN      862/vsftpd
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      781/systemd-resolve
tcp        0      0 127.0.0.1:38551         0.0.0.0:*               LISTEN      860/containerd
tcp        0      0 0.0.0.0:25              0.0.0.0:*               LISTEN      2367/master
tcp        0      0 127.0.0.1:6010          0.0.0.0:*               LISTEN      2974/sshd: ubuntu@p
tcp6       0      0 :::12865                :::*                    LISTEN      955/netserver
tcp6       0      0 :::111                  :::*                    LISTEN      1/init
tcp6       0      0 :::8080                 :::*                    LISTEN      10483/java
tcp6       0      0 :::80                   :::*                    LISTEN      985/nginx: master p
tcp6       0      0 :::25                   :::*                    LISTEN      2367/master
VM-0-11-ubuntu# ps -aux | grep 10483
tomcat     10483 20.1  6.1 2411244 125152 ?      Ssl  16:44   0:08 /usr/lib/jvm/java-8-openjdk-amd64/bin/java -Djava.util.logging.config.file=/var/lib/tomcat9/conf/logging.properties -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager -Djava.awt.headless=true -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -classpath /usr/share/tomcat9/bin/bootstrap.jar:/usr/share/tomcat9/bin/tomcat-juli.jar -Dcatalina.base=/var/lib/tomcat9 -Dcatalina.home=/usr/share/tomcat9 -Djava.io.tmpdir=/tmp org.apache.catalina.startup.Bootstrap start
root       10690  0.0  0.0   6300   672 pts/3    S+   16:44   0:00 grep 10483
```
最后将他干掉就好了

```
 3045  2022-01-07 16:37:22 sudo service jenkins restart
 3046  2022-01-07 16:37:26 sudo service jenkins status
 3062  2022-01-07 16:42:38 sudo service tomcat stop
```

EBLEBUWTMOXNVAMC

比较方便的是
```
lsof -i:80
```

104. 单独编译内核某个文件
前提 ./out 目录下 .config文件存在

编译成为 .s文件
```
makeARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- kernel/sched/core_ctl.s O=./out/
```


编译成为 .o文件, 还可以使用 objdump 来查看 函数的反汇编，在一些场景的优化下比较重要
```
make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- kernel/sched/core_ctl.o O=./out/
objdump -d kernel/sched/core_ctl.o
```

说到优化，就必须要说 内核的 gcc 编译优化等级了，在 Makefile 中
```
ifdef CONFIG_CC_OPTIMIZE_FOR_PERFORMANCE
KBUILD_CFLAGS += -O2
else ifdef CONFIG_CC_OPTIMIZE_FOR_PERFORMANCE_O3
KBUILD_CFLAGS += -O3
else ifdef CONFIG_CC_OPTIMIZE_FOR_SIZE
KBUILD_CFLAGS += -Os
endif
```
如果需要改 优化等级，直接在这里 hard code 修改为 `-O0` or `-O1` or `-O2`


105. 各个手机厂商开源的手机镜像
```
三星：
https://opensource.samsung.com/projects

小米:
device tree:  https://github.com/MiCode/kernel_devicetree/tree/umi-q-oss
kernel: https://github.com/MiCode/Xiaomi_Kernel_OpenSource

华为:
https://consumer.huawei.com/en/opensource/detail/?siteCode=worldwide&productCode=Smartphones&fileType=openSourceSoftware&pageSize=10&curPage=1

oppo:
https://github.com/oppo-source/FindX2

vivo:
https://opensource.vivo.com/Project

Qcom codeaurora:
https://www.codeaurora.org/
https://source.codeaurora.org/quic/la/kernel/common/

MTK fpsgo 代码
https://github.com/oppo-source/android_kernel_oppo_mt6833/tree/oppo/mt6833_s_12.1_oppo_k10_5g/drivers/misc/mediatek/performance/fpsgo_v3
```


Oplus:
https://github.com/OnePlusOSS

107. 博客
```
https://xinqiu.gitbooks.io/linux-inside-zh/content/SyncPrim/linux-sync-6.html
```

108. ubuntu删除旧版本内核image
查看机器安装过哪些版本image
```
ubuntu@zeku_server:/usr/sbin $ dpkg -l | grep linux-image-
ii  linux-image-5.11.0-22-generic              5.11.0-22.23                               amd64        Signed kernel image generic
ii  linux-image-5.11.0-25-generic              5.11.0-25.27                               amd64        Signed kernel image generic
ii  linux-image-5.11.0-38-generic              5.11.0-38.42                               amd64        Signed kernel image generic
ii  linux-image-5.13.0-20-generic              5.13.0-20.20                               amd64        Signed kernel image generic
ii  linux-image-5.13.0-21-generic              5.13.0-21.21                               amd64        Signed kernel image generic
ii  linux-image-5.13.0-22-generic              5.13.0-22.22                               amd64        Signed kernel image generic
iU  linux-image-5.13.0-27-generic              5.13.0-27.29                               amd64        Signed kernel image generic
rc  linux-image-5.4.0-71-generic               5.4.0-71.79                                amd64        Signed kernel image generic
rc  linux-image-5.4.0-72-generic               5.4.0-72.80                                amd64        Signed kernel image generic
iU  linux-image-generic                        5.13.0.27.37                               amd64        Generic Linux kernel image
ubuntu@zeku_server:/usr/sbin $
```
rc表示软件包已经删除（Removed），但配置文件（Config-files）还在．ii表示已经安装（Installed）．
可以用
```
sudo apt-get purge linux-image-5.13.0-21-generic
```
删除已经安装的image

109. linux && windows拆分合并大文件
windows需要
```
split trace.html -b 40m && tail -10 trace.html  > tail.html && cat xaa tail.html > new.html
```

110. 安卓过滤前台进程
```
logcat -b events | grep on_resume
```

安卓过滤前台进程之后，logcat退出，不阻塞当前shell
```
logcat -d -b events | grep on_resume
```


111. 安卓logcat 过滤某个tag的log
```
logcat *:S powerhal-libperfmgr
```

112. 安卓批量安装apk
```
# 使用应用宝下载apk，它可以保存apk文件
/sdcard/Android/data/com.tencent.android.qqdownloader/files/tassistant/apk/

# 先压缩再pull
adb shell "tar -jcvf /sdcard/Android/data/com.tencent.android.qqdownloader/files/tassistant/apk.tar.gz /sdcard/Android/data/com.tencent.android.qqdownloader/files/tassistant/apk"
adb pull //sdcard/Android/data/com.tencent.android.qqdownloader/files/tassistant/apk.tar.gz ./

# 直接 pull
adb shell "tar -jcvf /sdcard/Android/data/com.tencent.android.qqdownloader/files/tassistant/apk


# 遍历目录安装
for i in `ls ./`; do
  adb install -r "${i}"
done

```

113. echo 不换行

`echo -n "abc" && echo adf`


114. 如何在 Markdown 文件中插入图片

使用 Markdown 中 `![](/images/image.jpg)` 的方式访问图片。


115. CONFIG_COMPAT 含义
```
CONFIG_COMPAT －－－－－是否支持64 bit kernel上运行32bit 的application
```

116. System V 信号量 和 POSIX 信号量区别

System V它最初由AT&T开发，曾经也被称为AT&T System V，是Unix操作系统众多版本中的一支。在1983年第一次发布，一共发行了4个System V的主要版本，System V Release4，或者称为SVR4，是最成功的版本，该版本有些风格成为一些UNIX共同特性的源头，如下表格的初始化脚本/etc/init.d。用来控制系统的启动和关闭。
System v信号量测试基于内核的，它放在内核里面，要使用System V信号量需要进入内核态，所以在多线程编程中一般不建议使用System V信号量，因为线程相对于进程是轻量级的，从操作系统的调度开销角度看，如果使用System V信号量会使得每次调用都要进入内核态，丧失了线程的轻量优势。当我们讨论“System v信号量”时，所指的是计数信号量集。

Posix是Portable Operating System Interface(可移植性操作系统接口)的简称，是一个电气与电子工程学会即IEEE开发的一系列标准，目的是为运行在不同操作系统的应用程序提供统一的接口，实现者是不同的操作系统内核。
Posix信号量是基于内存的，即信号量值是放在共享内存中的，它使与文件系统中的路径名对应的名字来标识。当我们谈论“Posix 信号量”时，所指的是单个计数信号量。在Linux操作系统中，Posix信号量(共享内存、消息队列)可以通过ipcs命令查看。Posix信号量多用于进程间通信。


参考[Unix/Linux的System V、BSD、Posix概念](https://blog.csdn.net/qq_29344757/article/details/78657874)


117. 代码覆盖率统计方法
```
1. 在gcc编译代码时增加参数gcov
2. 使用gtest写ut用例，构造不同的参数，争取跑到函数中每个分支
3. 使用gcov还原代码执行过程，生成代码执行分析文件.html
```



118. 下载 `pixel6 kernel` 代码
a. https://source.android.com/setup/build/building-kernels#fromHistory
按照这个源来，但是 实际需要 切换源。

b. https://mirrors.tuna.tsinghua.edu.cn/help/AOSP/ 这是清华的 源
```
注意: 本镜像是 AOSP 镜像，Android SDK因版权原因，我们不能提供镜像服务。

可访问 https://cs.android.com 或 https://github.com/aosp-mirror 在线搜索及浏览 AOSP 源码。

参考 Google 教程 https://source.android.com/setup/build/downloading， 将 https://android.googlesource.com/ 全部使用 https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/ 代替即可。
```

实际命令
```
repo init -u https://mirrors.tuna.tsinghua.edu.cn/git/AOSP/kernel/manifest -b android-gs-raviole-5.10-android12L
```

需要注意环境变量



119. .repo 文件非常大

在 .repo 目录下执行

```
先查看
find . -name "*pack" -type f |xargs -I {} du -s {}|sort -k 1 -n|tail -10|awk '{print $2}'| xargs rm

再删除
find . -name "*pack" -type f |xargs -I {} du -s {}|sort -k 1 -n|tail -10|awk '{print $2}'| xargs rm
```


参考[删除repo中大文件](https://blog.csdn.net/linglaoli/article/details/80083877)


120. arm training 培训地址

```
https://arm.fuseuniversal.com/learning/plans
```




121. docker root权限 和 共享文件夹

docker
```
docker run -it --privileged -v /var/lib/jenkins/workspace/tmp:/BiscuitOS/tmp/ --name my_biscuitos biscuitos-docker:latest
```



122. 减少 aarch64 ubuntu image大小



123. ubuntu 启动时间优化
在使用 arm64 ubuntu debug kernel 过程中我遇到了 由于ubuntu 启动服务过多，导致ubuntu 从开机进入shell 需要 `90s` 的尴尬事情。
后面为了提高效率 将很多服务进行 stop，我们这里进行的优化主要是 systemd 启动服务的时间。

+ 首先查看所有服务耗时
```
systemd-analyze blame
```

+ 将耗时过长的服务，且不影响我们debug的服务进行 disable，永久停用
```
systemctl disable
```


124. youtube 双字幕
看youtube 视频可以使用 `YouTube™ 双字幕` 这个插件，有自带翻译功能。
chrome 也有一个自带的 实时字幕功能， 通过 `chrome://settings/accessibility` 就可以关闭打开。


125. CSV/TSV/PSV 格式



126. vscode 查询一串 hex 字符串 的string 内容
```
Hex Util
```



127. gdb无法单步调试

使用gdb调试单步程序时如果打印提示“single stepping until exit from function xxx,which has no line number information”，可能的原因有两个：
```
1 编译源文件时没有加-g选项；(二进制炸弹 遇到了)

2 gcc与gdb版本不兼容，通常是由于手工对gcc程序进行了升级，导致现有gdb程序版本过旧，比如gcc升级到4.8版本，gdb仍为旧的7.2版本。此时需要下载新版gdb源码包(7.8版本可行)，手工升级gdb。
```

128. google 浏览器插件
值得装的是
+ `uBlacklist`: 直接屏蔽一个网站，我是把 csdn.net给屏蔽了
+ `YouTube™ 双字幕`: youtube 视频翻译
+ `Adblock Plus - 免费的广告拦截器`:  拦截广告
+ `Vimium`: vim操作


129. shell 函数捕捉 `ctrl + c`
trap 是 shell 提供的一个 信号函数
```
trap 'rm $JENKINS_RUNNING_FILE; exit 1' INT
```

`trap -l` 可以列出总共的 `SIGNAL`

130. 在我的 jenkins 编译平台上经常会出现
`.config:129:warning: symbol value 'm' invalid for SCHED_CORE` warning。
这种 warning 主要是由于默认的 `.config` 中设置为了`m`,
但是 CONFIG_SCHED_CORE 只能配置为 y or n, 并不支持配置为 m
```
CONFIG_SCHED_CORE=m
```
改为
```
CONFIG_SCHED_CORE is not set
```

就不会报错了

在 `kernel/Kconfig.preempt` 文件中
```
config SCHED_CORE
	bool "Core Scheduling for SMT"
```


131. host主机上 docker 不用 sudo权限就能看大部分文件
```
sudo chmod 777 /var/run/docker.sock
```


132. biscuitos 的 docker构建
```
wget https://raw.githubusercontent.com/BiscuitOS/BiscuitOS/Stable_long/scripts/Docker/build.sh
chmod 777 build.sh && ./build.sh
```




133. qemu 虚拟机和host主机共享文件
a. 9p 网络文件系统方案

b. 共享挂载磁盘方案
https://blog.csdn.net/u011164819/article/details/121539326

134. ubuntu-base 构建最小qemu系统
通过 `ubuntu-base` 来构建
```
http://cdimage.ubuntu.com/ubuntu-base/releases/jammy/release/
```

135. last_kmsg 实现
```
mv last_kmsg.5  last_kmsg.6
mv last_kmsg.4  last_kmsg.5
mv last_kmsg.3  last_kmsg.4
mv last_kmsg.2  last_kmsg.3
mv last_kmsg.1  last_kmsg.2
mv last_kmsg    last_kmsg.1

dmesg > /tmp/log/kmsg
```


136. kthread 设置cpu 亲和性
```
void kthread_bind(struct task_struct *p, unsigned int cpu);
```

137. gdb-multiarch debug vmlinux 设置源码(source code) 目录
```
dir ~/Documents/glibc-2.28/build
```

138. 新建的docker image如何限制资源
```
sudo docker run -it --privileged --name my_ubuntu_01  --cpus=2  -m 1024M ubuntu:latest /bin/bash
```

139. 查看 某个函数的调用栈
```
sudo bpftrace -e 'kprobe:wakeup_softirqd { @[kstack] = count(); }'
```

140. 如何回复一个和自己无关的社区邮件
在这个网址找到一个patch
```
https://lore.kernel.org/all/164733306005.16921.3541059674681362392.tip-bot2@tip-bot2/
```

其中写明了如何回复这个邮件
```
git send-email \
    --in-reply-to=164733306005.16921.3541059674681362392.tip-bot2@tip-bot2 \
    --to=tip-bot2@linutronix.de \
    --cc=linux-kernel@vger.kernel.org \
    --cc=linux-tip-commits@vger.kernel.org \
    --cc=mingo@kernel.org \
    --cc=peterz@infradead.org \
    --cc=x86@kernel.org \
    --subject='Re: [tip: sched/core] sched/headers: Introduce kernel/sched/build_utility.c and build multiple .c files there' \
    /path/to/YOUR_REPLY
```

新发送一个邮件
```
git send-email /home/ubuntu/workspace/kvmtool/0001-update_headers.sh-Remove-arm-architecture.patch --to=sh_def@163.com
```

141. zeku qemu 虚拟机密码
x86
```
rlk:123
ubuntu:hjkl
```

arm64
```
rlk:123
ubuntu:hjkl
```

142. /sys/kernel/debug 目录是空的
```
mount -t debugfs debugfs /sys/kernel/debug
mkdir /sys/kernel/debug/tracing
mount -t tracefs tracefs /sys/kernel/debug/tracing
```

142. adb 常用命令
`https://www.jianshu.com/p/0693b841c83b`


143. PS1 定制
https://scriptim.github.io/bash-prompt-generator/

```
function parse_root() {
        echo `pwd` | sed 's?/remote/swg/users/hsu/?~/?'
}

PS1='\[\e[0;38;5;215m\][\[\e[0;1;4;38;5;173m\]$(git branch 2>/dev/null | grep '"'"'^*'"'"' | colrm 1 2)\[\e[0;38;5;215m\]]\[\e[0m\] \[\e[0;1;38;5;76m\]\t\[\e[0m\] hsu\[\e[0m\]@\[\e[0m\]zeku \[\e[0;1;2m\]`parse_root`\[\e[0m\] \[\e[0;38;5;160m\]$\[\e[0m\] \[\e[0m\]'
```

144. 大小核简称
```
silver: 小核
gold: 大核
prime: 超大核
```

145. adeb
adeb又名androdeb，旨在Android手机上搭建了一个基于adb shell命令行的debian操作系统环境，使我们能够直接在Android下运行主流Linux的命令行工具，更加快捷有效地对Android系统进行tracing、debugging、editing ... 基于adeb，我们可以利用传统Linux下强大的eBPF相关工具，轻松应对各种kernel诊断及分析。

https://github.com/joelagnel/adeb
https://android.googlesource.com/platform/external/adeb/

```
git clone https://github.com/joelagnel/adeb
cd adeb
sudo ln -s $(pwd)/adeb /usr/bin/adeb
adb root
adeb prepare
adeb prepare --full
adeb shell
```

进到 adeb 中去之后
```
apt update
apt upgrade
apt install bpftrace

```



146. guestfish kvm 管理工具
在宿主机和kvm虚拟机中实现文件传输，类似 docker与宿主机之间
```

```


147. 通过 inode 找到 filename
```
find  -inum 9787 2> /dev/null
```


148. 查看系统中线程数量
```
top -H
```
内核栈大小:
KernelStack = thread_num * 16kb



149. bpftrace 不能使用，缺少 symbols
```
sudo apt-get install bpftrace-dbgsym
```

参考[为 Ubuntu (22.04, jammy) 添加系统调试信息](https://zhuanlan.zhihu.com/p/576186351)


150. 中断栈、内核栈、用户栈 是否独立
用户栈都是独立的，与内核栈相独立
arm32: 内核栈与中断栈是一起的
arm64：内核栈与中断栈相独立
x86：内核栈与中断栈相独立



如何获取 `中断栈` 信息？
`arch/arm64/include/asm/stacktrace.h` 中
```
stackinfo_get_irq();
stackinfo_get_task();
```



150. 在中断中为什么不能睡眠 or 调度
中断上下文中 current 指向被中断的进程，但是current和当前中断上下文无任何关系。
如果在中断上下文中 进行睡眠或者调度，那么在执行完其他进程之后，cpu无法返回中断现场，
会导致当前处理的中断有问题，然后后续中断栈被浪费掉几个栈帧。


151. linux 小版本发布 release note
地址在：
https://kernelnewbies.org/Linux_6.1
每个版本在后面添加 banben号

152. 树莓派版本区别









153. armv8 qemu smp 裸机启动
github： https://github.com/duanev/pgdb/tree/fdefdbe043dff15fe1069daf6852ea417bed6415/examples/qemu/aarch64/smp


154. crontab 支持定时任务
crontab -e 来修改 用户的 crontab 文件
```
30 5 * * * stress -c 1
```
每天早上凌晨 5：30 执行 stress -c 1


155. rootfs 格式与 cpio.gz 格式区别

rootfs打包、修改： 需要root权限，然后mount到一个目录，做修改，然后umount。
cpio.gz 打包修改：不需要root权限，直有 cpio tools 做修改。



156. git status 显示中文乱码
```
git config --global core.quotepath false
```

157. 好的博客推荐
```
+ https://wangzhou.github.io/Linux%E9%80%8F%E6%98%8E%E5%A4%A7%E9%A1%B5-THP-%E5%88%86%E6%9E%90/
+ https://github.com/GaoleiBai/linux-learning/tree/master  --各个驱动开发笔记
```

158. ubuntu安装调试符号
参考[给ubuntu安装调试符号（符号表）和源码](https://www.cnblogs.com/pengdonglin137/articles/16295482.html)

https://launchpad.net/ubuntu/oracular/+search?text=6.11.0-9-generic-dbgsym
