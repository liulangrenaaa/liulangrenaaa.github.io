---
title: gnu built_in
date: 2021-09-14 19:00:00
tags:
    - tracepoint
    - aarch64
categories:
    - kernel debug
slug: "编译器/gnu-built_in"
---


## 简介
__builtin_开头的符号其实是一些编译器内置的函数或者编译优化处理开关等，其作用类似于宏。宏是高级语言用于预编译时进行替换的源代码块，而内置函数则是用于在编译阶段进行替换的机器指令块。因此编译器的这些内置函数其实并不是真实的函数，而只是一段指令块，起到编译时的内联功能。


## __builtin_types_compatible_p
比较两个 变量类型是否相同，`__builtin_types_compatible_p`, 如果一致返回true否则返回false, 在编译阶段就出了结果。

```
#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

int main(int argc, char **argv)
{
        int a = 1, b = 2, c = 3;
        char e = 4, d = 5;

        bool f = false;
        f = __builtin_types_compatible_p(int, typeof(a));
        printf("a is int %d\n", f);
        f = __builtin_types_compatible_p(typeof(e), typeof(a));
        printf("a & e is same type %d\n", f);
}
```

`objdump -S a.out` 之后
```
0000000000001149 <main>:
    1149:       f3 0f 1e fa             endbr64
    114d:       55                      push   %rbp
    114e:       48 89 e5                mov    %rsp,%rbp
    1151:       48 83 ec 20             sub    $0x20,%rsp
    1155:       89 7d ec                mov    %edi,-0x14(%rbp)
    1158:       48 89 75 e0             mov    %rsi,-0x20(%rbp)
    115c:       c7 45 f4 01 00 00 00    movl   $0x1,-0xc(%rbp)
    1163:       c7 45 f8 02 00 00 00    movl   $0x2,-0x8(%rbp)
    116a:       c7 45 fc 03 00 00 00    movl   $0x3,-0x4(%rbp)
    1171:       c6 45 f1 04             movb   $0x4,-0xf(%rbp)
    1175:       c6 45 f2 05             movb   $0x5,-0xe(%rbp)
    1179:       c6 45 f3 00             movb   $0x0,-0xd(%rbp)
    117d:       c6 45 f3 01             movb   $0x1,-0xd(%rbp)
    1181:       0f b6 45 f3             movzbl -0xd(%rbp),%eax
    1185:       89 c6                   mov    %eax,%esi
    1187:       48 8d 3d 76 0e 00 00    lea    0xe76(%rip),%rdi        # 2004 <_IO_stdin_used+0x4>
    118e:       b8 00 00 00 00          mov    $0x0,%eax
    1193:       e8 b8 fe ff ff          call   1050 <printf@plt>
    1198:       c6 45 f3 00             movb   $0x0,-0xd(%rbp)
    119c:       0f b6 45 f3             movzbl -0xd(%rbp),%eax
    11a0:       89 c6                   mov    %eax,%esi
    11a2:       48 8d 3d 68 0e 00 00    lea    0xe68(%rip),%rdi        # 2011 <_IO_stdin_used+0x11>
    11a9:       b8 00 00 00 00          mov    $0x0,%eax
    11ae:       e8 9d fe ff ff          call   1050 <printf@plt>
    11b3:       b8 00 00 00 00          mov    $0x0,%eax
    11b8:       c9                      leave
    11b9:       c3                      ret
    11ba:       66 0f 1f 44 00 00       nopw   0x0(%rax,%rax,1)
```

可以看到 `-0xd(%rbp)` 这个地址存放的就是 变量 `f` 的值，
` f = __builtin_types_compatible_p(int, typeof(a));` 编译之后成为了 `117d:       c6 45 f3 01             movb   $0x1,-0xd(%rbp)`

`f = __builtin_types_compatible_p(typeof(e), typeof(a));`  编译之后成为了 `    1198:       c6 45 f3 00             movb   $0x0,-0xd(%rbp)`

可以看出 `__builtin_types_compatible_p` 结果在编译时就已经确定了。

这个在 static-key 机制中使用。





## __builtin_constant_p
来判断某个表达式是否是一个常量，如果是常量返回true否则返回false

```

```



后续补充。。
































参考[LLVM编译器中的内置(built-in)函数](https://cloud.tencent.com/developer/article/1425272)

参考[llvm 编译器学习之路](https://cloud.tencent.com/developer/inventory/533)


