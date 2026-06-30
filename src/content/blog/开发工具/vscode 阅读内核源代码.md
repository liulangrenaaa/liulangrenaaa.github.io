---
title: vscode 阅读内核源码
date: 2020-09-03 19:00:00
tags:
    - 开发工具
categories:
    - 开发工具
slug: "开发工具/vscode-阅读内核源代码"
---


## cpptools 方法
相信大多数人使用vscode阅读内核源码跟我一开始的做法是一样的：
```
1. 下载vscode,安装Remote-ssh,C/C++解析等工具
2. 建立 kernel workspace,添加kernel代码
```
其实这样从我实际的体验来说都要比 SI,Vim 要方便一点了，但是我们还是会遇到 找
```
1. 不到清晰的定义，类似于多个slab slub slob的代码，通常都是乱跳转
2. 硬件体系结构相关代码和kernel 通用代码之间跳转的时候乱跳转
3. kernel 代码中有很多宏定义，不知道实际到底定义了哪些宏，如果看代码的时候需要对比.config文件，那效率会大大降低
4. 看一个代码文件，也不知道当前工作会不会用到，可能看到代码，在你工作的环境根本就不会编译
```
你是不是也有这样的困惑呢？
我们接下来一条一条的解决上面这几个问题，让你在看内核代码时畅通无阻
```
1. 第一点和第二点可以通过在 settings.json中 设置 search.exclude files.exclude来避免, search.exclude 可以避免你搜索时搜索到他，files.exclude可以直接让你在文件列表视图上看不到他
2. 主要原因是 Vscode 默认认为宏是未定义的。
可以写一个简单脚本来处理 .config 文件，将其中 =y =m的 CONFIG 项目提取出来，最后在settings.json中 设置 DEFINE 的项，来避免这个问题
3. 这个就需要使用 gcc的特性 和 cpp解析的插件了，还需要新版本内核提供的一个脚本
```
[解析config文件脚本](https://github.com/liulangrenaaa/gernerate_config)
下面我重点来讲如何利用 内核编译产生的中间文件，来解析建立你的工程
1. 首先需要下面这个脚本，超过4.19的版本内核应该有这个文件
```
sh@ubuntu:~/workspace/linux$ find ./scripts/ -name gen_compile*
./scripts/gen_compile_commands.py
```
2. 先编译bzImage
```
mkdir out
cp .config ./out/.config
make -j4 bzImage O=./out
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


贴一下 .vscode/c_cpp_properties.json 配置
```
{
    "env": {
      "myDefaultIncludePath": ["${workspaceFolder}", "${workspaceFolder}/include"],
      "myCompilerPath": "/usr/local/bin/gcc-9"
    },
    "configurations": [
      {
        "name": "linux-kernel",
        "intelliSenseMode": "gcc-x64",
        "includePath": ["${myDefaultIncludePath}"],
        "defines": [
            "__KERNEL__",
            "BAR=100"],
        "compilerPath": "/usr/bin/clang",
        "cStandard": "c11",
        "cppStandard": "c++17",
        "compileCommands": "${workspaceFolder}/out/compile_commands.json",
        "browse": {
          "path": ["${workspaceFolder}"],
          "limitSymbolsToIncludedHeaders": true,
          "databaseFilename": ""
        }
      }
    ],
    "version": 4
}
```
注意"intelliSenseMode": "gcc-x64" 不同平台配置不一样，我是代码放在ubuntu20上，所以是gcc-x64


## clangd 方法

1. 仍然需要生成 compile_commands.json，
2. settings 中搜索 clangd，在用户 与 远程中添加 `--compile-commands-dir=${workspaceFolder} --background-index --completion-style=detailed --header-insertion=never -log=info`
3. 对于 arm64 工程添加
```
CompileFlags:
  Add: --target=aarch64-linux-gnu
  Remove: -mabi=lp64
```

4.

使用VSCode进行linux内核代码阅读和开发

https://blog.csdn.net/xhnmdlfl/article/details/117911630