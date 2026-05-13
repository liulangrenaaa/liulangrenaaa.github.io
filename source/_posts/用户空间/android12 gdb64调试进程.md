---
title: android12 gdb64调试进程
date: 2021-09-23 19:00:00
tags:
    - android12 gdb64调试进程
    - android framework
categories:
    - linux内核
---

# 背景
在研究`pixel6` 双X1调度策略时，发现在render_thread 中最后会通过 reportworkduration
来设置 task的uclamp_min。
在游戏场景下，由于没有走安卓标准绘制流程，不存在 render_thread，所以肯定不是走的应用滑动场景的 SetUclamp 的代码路径

有两种方式确定，一是读代码，但是这种可能会有多个代码路径。并不能确定到底是具体哪一个代码路径；二是通过gdb调试，打断点，然后查看backtrace，这种方式可以确定实际代码路径，但是较为繁琐。

# gdb 调试

## 确定需要被 gdb 断点的进程
可以发现 uclamp_min 值不为0的时候，`pid`为 552的 `android.hardware.power-service.pixel-libperffmgr` 进程输出的 `adpf.2731-10090-d010-min` val也是 210。

说明 此次我们需要trace的进程就是 552



## 设备之间的关系

`windows` `wsl` `android phone` 三个设备

我们可以只用两个设备, `android phone` 是必须的， `wsl` `windows phone` 是随便选一个作为host 主机。我们选 `wsl` 作为host主机，来gdb调试 `android phone`。

正常gdb调试中，host主机 与 被调试代码都是在 同一个设备上，但是在 调试`android phone`中，host主机 和 被调试的`android phone`的代码不在一个设备上，gdb是通过 tcp通信的，所以需要在host主机中将设备的 gdbserver 端口号进行一次转发，这样才能可以debug。

## debug步骤

### wsl 主机转发 android phone的端口
可以直接使用 `adb forward` 来进行转发。
```
ubuntu@wsl:~ $ adb forward tcp:23946 tcp:23946
23946
ubuntu@wsl:~ $
```


### android phone gdbserver attach 被调试的程序

正常直接 grep出 需要attach的进程的pid即可，然后使用 `gdbserver64` 进行attach
如：
```
raven:/ # ps -e | grep power
system         735     1 10852056  5948 binder_wait_for_work 0 S android.hardware.power.stats-service.pixel
root         11621     2       0      0 worker_thread       0 I [kworker/u17:0-kbase_pm_poweroff_wait]
root         11956     2       0      0 worker_thread       0 I [kworker/u17:1-kbase_pm_poweroff_wait]
root         11973     1 10902368  5760 binder_wait_for_work 0 S android.hardware.power-service.pixel-libperfmgr
raven:/ # gdbserver64 :23946 --attach 11973
Attached; pid = 11973
Listening on port 23946
Remote debugging from host 127.0.0.1, port 57517
```

android设备上需要安装`gdbserver/gdbserver64`（调试arm64程序需要使用
`userdebug`固件可能会自带gdbserver/gdbserver64程序，
而`user`版android固件并没有把gdbserver编译到系统中，需要我们手动push。
```
raven:/ # gdbserver64 --help
Usage:  gdbserver [OPTIONS] COMM PROG [ARGS ...]
        gdbserver [OPTIONS] --attach COMM PID
        gdbserver [OPTIONS] --multi COMM

COMM may either be a tty device (for serial debugging),
HOST:PORT to listen for a TCP connection, or '-' or 'stdio' to use
stdin/stdout of gdbserver.
PROG is the executable program.  ARGS are arguments passed to inferior.
PID is the process ID to attach to, when --attach is specified.

Operating modes:

  --attach              Attach to running process PID.
  --multi               Start server without a specific program, and
                        only quit when explicitly commanded.
  --once                Exit after the first connection has closed.
  --help                Print this message and then exit.
  --version             Display version information and exit.

Other options:

  --wrapper WRAPPER --  Run WRAPPER to start new programs.
  --disable-randomization
                        Run PROG with address space randomization disabled.
  --no-disable-randomization
                        Don't disable address space randomization when
                        starting PROG.
  --startup-with-shell
                        Start PROG using a shell.  I.e., execs a shell that
                        then execs PROG.  (default)
  --no-startup-with-shell
                        Exec PROG directly instead of using a shell.
                        Disables argument globbing and variable substitution
                        on UNIX-like systems.

Debug options:

  --debug               Enable general debugging output.
  --debug-format=opt1[,opt2,...]
                        Specify extra content in debugging output.
                          Options:
                            all
                            none
                            timestamp
  --remote-debug        Enable remote protocol debugging output.
  --disable-packet=opt1[,opt2,...]
                        Disable support for RSP packets or features.
                          Options:
                            vCont, Tthread, qC, qfThreadInfo and
                            threads (disable all threading packets).

For more information, consult the GDB manual (available as on-line
info or a printed manual).
Report bugs to "<http://www.gnu.org/software/gdb/bugs/>".
```




### host 主机运行gdb 准备调试

```
ubuntu@wsl:/mnt/d/Users/50001309/AppData/Local/Android/Sdk/ndk/23.1.7779620/prebuilt/windows-x86_64/bin $ ./gdb.exe

D:\Users\50001309\AppData\Local\Android\Sdk\ndk\23.1.7779620\prebuilt\windows-x86_64\bin\gdb-orig.exe: warning: Couldn't determine a path for
the index cache d
irectory.
GNU gdb (GDB) 8.3
Copyright (C) 2019 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-w64-mingw32".
Type "show configuration" for configuration details.
--Type <RET> for more, q to quit, c to continue without paging--
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
(gdb) file /mnt/d/Users/50001309/Downloads/debug/vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr
/mnt/d/Users/50001309/Downloads/debug/vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr: No such file or directory.
(gdb) target remote :23946
Remote debugging using :23946
Reading /vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr from remote target...
warning: File transfers from remote targets can be slow. Use "set sysroot" to access files locally instead.
BFD: target:/vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr: unknown type [0x13] section `.relr.dyn'
Reading /vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr from remote target...
BFD: target:/vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr: unknown type [0x13] section `.relr.dyn'
Reading symbols from target:/vendor/bin/hw/android.hardware.power-service.pixel-libperfmgr...
```


然后直接 就是 `b` `c` `info b` 等常见的gdb调试的步骤。




参考[使用gdb远程调试android native程序](https://blog.csdn.net/rikeyone/article/details/80284115)

