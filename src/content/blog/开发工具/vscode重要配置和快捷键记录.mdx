---
title: vscode task.json 与 launch.json配置
date: 2021-01.24 19:00:00
tags:
    - vscode
    - task.json
    - launch.json
    - gdb
categories:
    - 开发工具
slug: "开发工具/vscode重要配置和快捷键记录"
---


## 快捷键
1. 撤销光标移动 `Ctrl + U`

2. 一行代码太长被折叠成为多行了，想切换回一行 `Alt + z`

3. 多行编辑 `Alt + 鼠标左键`可以选择好要编辑位置

4. 跳转 `F12` 跳转回来 `带前进后退的鼠标后退` or `Alt + <-`

5. 折叠文件代码 `Ctrl + 0`, 展开文件代码 `Ctrl + J`

6. 折叠部分代码 `Ctrl + Shift + [`, 展开部分代码 `Ctrl + Shift + ]`

7. 显示参数：放到函数后面()内，`Ctrl + Shift + Space`

8. 切换到原有终端
```
Ctrl + `
```
创建一个新终端
```
Ctrl + Shift + `
```

9. 移动到行首 `Home`， 移动到行尾 `END`

10. 移动到文件头 `Ctrl + Home`， 移动到文件尾 `Ctrl + END`

11. 编辑器Tab 切换 `Ctrl + PageUp` + `Ctrl + PageDown`

12. 快速格式化当前文件代码 `Shift` + `Alt` + `F`




## task.json
### What?
vscode 提供了 `默认task的配置` 和 `每个workspace的 task配置`。
可以通过 `Ctrl + Shift + p`，输入`task`，可以选择 `配置` `运行` task。
可以减少运行的时候少敲几个命令。。

### example
下面看我给`linux kernel` 工作区配置的一些`task`。

文件位于
```
amd_server@ubuntu: ~/workspace/linux-stable# ls .vscode
c_cpp_properties.json  launch.json  tasks.json
amd_server@ubuntu: ~/workspace/linux-stable#
```

内容：
```
{
        // See https://go.microsoft.com/fwlink/?LinkId=733558
        // for the documentation about the tasks.json format
        "version": "2.0.0",
        "tasks": [
                {
                        "label": "vm-start",
                        "type": "shell",
                        "command": "sudo qemu-system-x86_64 -kernel /home/ubuntu/workspace/linux-stable/out/arch/x86/boot/bzImage -hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img -append "root=/dev/sda5 console=ttyS0 crashkernel=256M" -smp 4 -m 2048 --enable-kvm -net nic -net user,hostfwd=tcp::2222-:22 --nographic -fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                },
                {
                        "label": "vm-stop",
                        "type": "shell",
                        "command": "sudo pkill qemu",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                },
                {
                        "label": "vm-restart",
                        "type": "shell",
                        "command": "sudo pkill qemu ; echo "qemu have been stopped, now run the new qemu..."; sudo qemu-system-x86_64 -kernel /home/ubuntu/workspace/linux-stable/out/arch/x86/boot/bzImage -hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img -append "root=/dev/sda5 console=ttyS0 crashkernel=256M" -smp 4 -m 2048 --enable-kvm -net nic -net user,hostfwd=tcp::2222-:22 --nographic -fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none -device virtio-9p-pci,fsdev=fs1,mount_tag=host_share",
                        "presentation": {
                                "echo": true,
                                "clear": true,
                                "group": "vm"
                        },
                },
                {
                        "label": "make",
                        "type": "shell",
                        "command": "make -j10 O=./out && python ./scripts/clang-tools/gen_compile_commands.py -d ./out/",
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
                        "label": "make clean",
                        "type": "shell",
                        "command": "make mrproper;",
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
                        "label": "remake",
                        "type": "shell",
                        "command": "make mrproper && make -j10 O=./out && python ./scripts/clang-tools/gen_compile_commands.py -d ./out/",
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
                        "label": "generate label",
                        "type": "shell",
                        "command": "python ./scripts/clang-tools/gen_compile_commands.py -d ./out/",
                        "group": {
                                "kind": "build",
                                "isDefault": true
                        },
                        "presentation": {
                                "echo": false,
                                "group": "build"
                        }
                }
        ]
}
```

设置了 `vm-start` `vm-stop` `vm-restart` `make` `make clean` `remake` `generate label`，这些task，可以随时 `Ctrl + Shift + p` 呼出来运行。极大方便了编译运行配置。。


## launch.json
### What?
vscode 提供了 `launch` 来配置debug相关参数。后面会以 `benos` 为例记录一下

### example
下面看我给`benos` 工作区配置的一些参数








参考[CodeTalks](https://howardlau.me/programming/debugging-linux-kernel-with-vscode-qemu.html)
参考[极客课程](https://geek-docs.com/vscode/vscode-tutorials/how-does-vscode-create-custom-tasks.html)
