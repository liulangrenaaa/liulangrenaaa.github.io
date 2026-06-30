---
title: ftrace 原理
date: 2022-04-29 19:00:00
tags:
    - 原理
    - ftrace
categories:
    - linux内核
slug: "内核观测/ftrace/ftrace-原理"
---


时隔两年之后，再看 ftrace比当初只知道 看看 tracer 更加感受到了 ftrace的强大。


## 依赖工具
ftrace 支持动态trace，即可以跟踪内核和模块中任意的全局函数。它利用了gcc的-pg编译选项，在每个函数的开始增加一个stub，这样在需要的时候可以控制函数跳转到指定的代码中去执行。

在 ./Makefile 中
```
ifdef CONFIG_FUNCTION_TRACER
  CC_FLAGS_FTRACE := -pg
endif
```



