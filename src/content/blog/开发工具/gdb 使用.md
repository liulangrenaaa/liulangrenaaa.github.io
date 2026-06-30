---
title: gdb 使用
date: 2022-03-28 19:00:00
tags:
    - 开发工具
    - gdb
categories:
    - 开发工具
slug: "开发工具/gdb-使用"
---



## 简介
GDB是一个由GNU开源组织发布的、UNIX/LINUX操作系统下的、基于命令行的、功能强大的程序调试工具。不仅仅可以用来调试 应用程序，也可以用来调试 linux kernel。








## tips
记录几个 gdb 重要的技巧

1. gdb 启动初始化
用户可以设置 启动gdb 时加载个性化配置，类似于 .bashrc or .vimrc那样
gdb初始化文件 位于 ~/.gdbinit 下
常用的 ~/.gdbinit 内容

```
 # 保存历史命令
set history filename ~/.gdb_history
set history save on

# 退出时不显示提示信息
set confirm off

# 按照派生类型打印对象
set print object on

# 打印数组的索引下标
set print array-indexes on

# 每行打印一个结构体成员
set print pretty on
```



2. 保存gdb 日志
有时候debug现场很难复现，就需要将gdb debug的现场保留下来，后续查看

+ 开启 gdb 日志
```
set logging on
```

+ 设置保存gdb日志的文件
```
set logging file log.txt
```



3. gdb 执行shell 命令
在 gdb 窗口中，可以直接 `shell cmd` 来执行 shell 命令


4. gdb 不显示启动信息

```
gdb -q
```

5. gdb 不显示退出信息

```
set confirm off
```

6. gdb 输出多余一屏幕信息时不会暂停输出
```
set height 0
```

7. 只是退出当前执行的函数

`fin`




8. gdb load kernel module 的symbols
如果仅仅是running的 kernel insmod了 ko，但是gdb中没有 Load symbols，那样是无法debug ko的。
`b sched_get_cpu_util` 就会显示
```
-exec b sched_get_cpu_util
Function "sched_get_cpu_util" not defined.
Make breakpoint pending on future shared library load? (y or [n]) [answered N; input not from terminal]
```
直接提示 `not defined`...

通过
```
-exec add-symbol-file /remote/swg/users/hsu/workspace/z3_g13/common/out/vendor/modules/sched/sched-walt.ko 0xffffffc0012e7000
```
加载 kernel module ko的symbols之后
显示
```
-exec b sched_get_cpu_util
Breakpoint 10 at 0xffffffc0012f3544: file ../../vendor/modules/sched/sched_avg.c, line 253.
```

关于这个 ko 之后之后的 地址 `0xffffffc0012e7000`, 是从
`cat /sys/module/sched-walt/sections/.text` 中读取的

参考[Debugging The Linux Kernel Using Gdb](https://www.elinux.org/Debugging_The_Linux_Kernel_Using_Gdb)


9.








## vscode + qemu + gdb + task.json + launch.json 调试 linux kernel
在 terminal 中使用 gdb命令时需要添加 前缀 `-exec`

+ task.json 配置
```
{
        // See https://go.microsoft.com/fwlink/?LinkId=733558
        // for the documentation about the tasks.json format
        "version": "2.0.0",
        "tasks": [
                {
                        "label": "start-biscuitos",
                        "type": "shell",
                        "command": "/BiscuitOS/output/linux-5.10-aarch/RunBiscuitOS.sh",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                        "problemMatcher": []
                },
                {
                        "label": "debug-biscuitos",
                        "type": "shell",
                        "command": "/BiscuitOS/output/linux-5.10-aarch/RunBiscuitOS.sh debug",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                        "problemMatcher": []
                },
                {
                        "label": "start-arm64-ubuntu",
                        "type": "shell",
                        "command": " sudo /BiscuitOS/output/linux-5.10-aarch/qemu-system/qemu-4.0.0/aarch64-softmmu/qemu-system-aarch64 -hda /root/myspace/qemu_build/ubuntu/aarch64_ubuntu.img -kernel /root/workspace/linux-5.10/out/arch/arm64/boot/Image -append 'console=ttyAMA0 root=/dev/vda1' -m 2048M -smp 8 -M virt -cpu cortex-a72 -net nic -net user,hostfwd=tcp::2222-:22 -nographic -fsdev local,id=fs1,path=/root/workspace/share,security_model=none -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                        "problemMatcher": []
                },
                {
                        "label": "vm-stop",
                        "type": "shell",
                        "command": "sudo pkill qemu ; echo 'qemu stoped'",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm_stop"
                        }
                },
                {
                        "label": "make",
                        "type": "shell",
                        "command": "make -j12 ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- Image O=./out/ && echo '****************make is ready**************'",
                        "group": {
                                "kind": "build",
                                "isDefault": true
                        },
                        "presentation": {
                                "echo": false,
                                "group": "build"
                        }
                },
                {
                        "label": "gen label",
                        "type": "shell",
                        "command": "python ./scripts/clang-tools/gen_compile_commands.py -d ./out/",
                        "group": {
                                "kind": "build",
                                "isDefault": true
                        },
                        "presentation": {
                                "echo": false,
                                "group": "label"
                        }
                }
        ]
}
```



+ launch.json 配置
```
{
        // Use IntelliSense to learn about possible attributes.
        // Hover to view descriptions of existing attributes.
        // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
        "version": "0.2.0",
        "configurations": [
            {
                "name": "kernel-debug",
                "type": "cppdbg",
                "request": "launch",
                "miDebuggerServerAddress": "127.0.0.1:1234",
                "miDebuggerPath": "/usr/bin/gdb-multiarch",
                "program": "${workspaceFolder}/out/vmlinux",
                "args": [],
                "stopAtEntry": false,
                "cwd": "${workspaceFolder}",
                "environment": [],
                "externalConsole": true,
                "hardwareBreakpoints": {},
                "logging": {
                    "engineLogging": false
                },
                "MIMode": "gdb",
                "postRemoteConnectCommands": [
                        {
                                "text": "dir /remote/swg/users/hsu/workspace/z3_g13/common/common"
                        },
                        {
                                "text": "add-symbol-file /remote/swg/users/hsu/workspace/z3_g13/common/out/vendor/modules/sched/sched-walt.ko 0xffffffc0012e7000"
                        },
                ],
                "setupCommands": [
                        {
                                "text": "source /remote/swg/users/hsu/.gdbinit"
                        }
                ],
            }
        ]
}
```
上面配置了
+ 建立连接之前：setupCommands 设置了 .gdbinit 脚本。在gdbinit脚本中添加很多命令，包含linux kernel 自己的 vmlinux-gdb.py
```
add-auto-load-safe-path /path/vmlinux-gdb.py
```
.gdbinit 是 github 上开源的。
+ 端口： 设置了链接本机 127.0.0.1:1234 端口
+ 建立连接之后： 设置源码目录，加载模块symbols 到指定地址
+ 设置 源码符号： program







上面是 vscode 两个 json文件的配置，配置之后可以很快的进行debug。

我是用的 `RunBiscuitOS` 的环境，可以使用他的 docker 来进行构建，中间遇到过几个权限问题（具体什么问题忘了。。不过都好解决，以后配置机会不多，一个环境应该可以长期用下去），但是用物理机环境搞我是遇到过很多问题，建议用 docker搞。

debug 启动时用的 qemu, 在 docker 环境中直接使用 `/BiscuitOS/output/linux-5.10-aarch/RunBiscuitOS.sh debug` 即可，也可以使用qemu去启动tools 更加全面的 ubuntu image。



vscode debug 过程中的有不一样的是
+ 左边 堆栈可以看到每个 cpu core 的堆栈，很方便了解各个cpu执行流程
+ 监视视图： 可以输入 `fair_tmp_i > 10` 等这种 表达式
+ 关于断点: 可以在每一行最左边右击鼠标 选择 `添加断点` or `添加条件断点` or `添加记录点`
+ 在 debug console 中，执行所有命令都是报错`-var-create: unable to create variable object`，因为是设计使然（by design）。要是想在 调试控制台上直接输入命令，需要 加一个前缀 `-exec cmd`

for example
```
watch fair_tmp_i > 1350
-var-create: unable to create variable object
watch fair_tmp_i > 1350
-var-create: unable to create variable object
exec watch fair_tmp_i > 1350
-var-create: unable to create variable object
-exec watch fair_tmp_i > 1350
Hardware watchpoint 12: fair_tmp_i > 1350

r
-var-create: unable to create variable object
-exec r
The "remote" target does not support "run".  Try "help target" or "continue".

-exec c
Continuing.

Thread 2 hit Hardware watchpoint 12: fair_tmp_i > 1350

Old value = 0
New value = 1
select_task_rq_fair (p=0xffff000003076040, prev_cpu=1, sd_flag=8, wake_flags=0) at ../kernel/sched/fair.c:6739
6739		if (sd_flag & SD_BALANCE_WAKE) {
```
问题可以看 [github 记录](https://github.com/microsoft/vscode-cpptools/issues/7400)







参考 [b站视频1](https://www.bilibili.com/video/BV1zv411G7j8?p=7&spm_id_from=pageDriver)
参考 [b站视频2](https://www.bilibili.com/video/BV1EK411g7Li?spm_id_from=333.999.0.0)
参考 [100个gdb小技巧](https://wizardforcel.gitbooks.io/100-gdb-tips/content/config-gdbinit.html)
参考 [b站视频]()
