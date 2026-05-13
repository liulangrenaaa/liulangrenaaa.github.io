---
title: arm64 kernel 编译 + vscode解析
date: 2021-03-18 19:00:00
tags:
    - 开发工具
categories:
    - 开发工具
---

最近要换坑位了，下一家公司是做arm64手机芯片的，所以先熟悉一下arm64 kernel 开发环境的配置。

## 准备工作
1. 安装 aarch64 架构的gcc编译器。
```
Inspiron-5548@100ubuntu: ~/workspace/linux-stable# sudo apt install gcc-aarch64-linux-gnu
正在读取软件包列表... 完成
正在分析软件包的依赖关系树
正在读取状态信息... 完成
下列软件包是自动安装的并且现在不需要了：
  gir1.2-keybinder-3.0 libfprint-2-tod1 libkeybinder-3.0-0 python3-configobj python3-psutil
使用'sudo apt autoremove'来卸载它(它们)。
将会同时安装下列软件：
  cpp-aarch64-linux-gnu
建议安装：
  cpp-doc gdb-aarch64-linux-gnu gcc-doc
下列【新】软件包将被安装：
  cpp-aarch64-linux-gnu gcc-aarch64-linux-gnu
升级了 0 个软件包，新安装了 2 个软件包，要卸载 0 个软件包，有 80 个软件包未被升级。
需要下载 4,852 B 的归档。
解压缩后会消耗 56.3 kB 的额外空间。
```

2. 准备 defconfig
```
Inspiron-5548@130ubuntu: ~/workspace/linux-stable# cp arch/arm64/configs/defconfig .config
Inspiron-5548@ubuntu: ~/workspace/linux-stable#
```

## 编译
1. 配置 config

`make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- menuconfig`

```
Inspiron-5548@ubuntu: ~/workspace/linux-stable# make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- menuconfig
.config:745:warning: symbol value 'm' invalid for KVM
configuration written to .config

*** End of the configuration.
*** Execute 'make' to start the build or try 'make help'.

Inspiron-5548@ubuntu: ~/workspace/linux-stable#
```

2. 编译
`make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- all -j4`

```
Inspiron-5548@ubuntu: ~/workspace/linux-stable# make ARCH=arm64 CROSS_COMPILE=/usr/bin/aarch64-linux-gnu- all -j4 O=./out

  SYNC    include/config/auto.conf.cmd
  HOSTCC  scripts/kconfig/conf.o
  HOSTLD  scripts/kconfig/conf
  WRAP    arch/arm64/include/generated/uapi/asm/kvm_para.h
  WRAP    arch/arm64/include/generated/uapi/asm/errno.h
  ......
```

3. 生成compile_commands.json
```
# 4.19 - 5.8 之前可以用
./scripts/gen_compile_commands.py -d ./out/
# 5.9 之后可以用
./scripts/clang-tools/gen_compile_commands.py -d ./out/
```

4. 配置 .vscode/c_cpp_properties.json
```
{
# 4.19 - 5.8 之前可以用
    .....
    "compileCommands": "${WorkspaceFolder}/out/compile_commands.json"
    .....
# 5.9 之后可以用
    .....
    "compileCommands": "${WorkspaceFolder}/compile_commands.json"
    .....
}
```
到此为止，基本上在浏览内核代码上不会有困难了