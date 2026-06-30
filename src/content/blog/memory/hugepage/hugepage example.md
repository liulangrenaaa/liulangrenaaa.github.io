---
title: hugepage example
date: 2021-02-01 19:00:40
tags:
    - hugepage
    - memory
categories:
    - linux内核
slug: "memory/hugepage/hugepage-example"
---



熟悉一项技术的最简单方式就是去使用他，而不是蒙头去看源代码。
## 概念
这只是我当前的理解，TIME: 2021-06-09
```
huge page: 对大页的统称，相对于 4k 的小页来说
hugetlb  : hugetlb 是 huge page 的一种使用机制，静态分配预留机制
hugetlbfs: 是一个文件系统，为用户提供使用 预留的 hugetlb 的文件系统
```

## 环境准备
需要安装 `libhugetlbfs`，源码在 [github](https://github.com/libhugetlbfs/libhugetlbfs)

```
ubuntu@zeku_server:/tmp/test $ sudo apt-cache search libhugetlbfs
libhugetlbfs-bin - Tools to ease use of hugetlbfs
libhugetlbfs-dev - Development files to build programs using libhugetlbfs
libhugetlbfs0 - Preload library to back program memory with hugepages
ubuntu@zeku_server:/tmp/test $
```

`mount` 检查 `hugetlbfs` 是否挂载
```
ubuntu@zeku_server:~ $ mount | grep huge
cgroup on /sys/fs/cgroup/hugetlb type cgroup (rw,nosuid,nodev,noexec,relatime,hugetlb)
hugetlbfs on /dev/hugepages type hugetlbfs (rw,relatime,pagesize=2M)
```

### 设置 `huge page` 的数量
设置 `huge page` 数量前
```
ubuntu@zeku_server:~ $ cat /proc/meminfo  | grep Huge
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
FileHugePages:         0 kB
HugePages_Total:       0
HugePages_Free:        0
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:               0 kB
ubuntu@zeku_server:~ $
```

设置 `huge page` 数量
```
ubuntu@zeku_server:~ $ cat /proc/sys/vm/nr_hugepages
0
ubuntu@zeku_server:~ $ sudo su
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu# echo 128 > /proc/sys/vm/nr_hugepages
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu# exit
exit
ubuntu@zeku_server:~ $ cat /proc/sys/vm/nr_hugepages
128
ubuntu@zeku_server:~ $
```

设置 `huge page` 数量后
```
ubuntu@zeku_server:~ $ cat /proc/meminfo  | grep Huge
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
FileHugePages:         0 kB
HugePages_Total:     128
HugePages_Free:      128
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:          262144 kB
ubuntu@zeku_server:~ $
```

## test code
准备代码
```
#include <stdio.h>

int main()
{
	int i, len;
	int *mem;
	len = 98 * 1024 * 1024;
	mem = (int*)malloc(sizeof(int) * len);
	for(i = 0; i < len; i++)
		mem[i] = i;
	getchar();
	free(mem);
	return 0;
}
```

虽然会一开始直接申请 `13M` 大小的 memory，不做特殊处理情况下，这个程序也不会使用到 `huge page`。

### 直接运行
直接编译运行之后，查看 `/proc/meminfo`:
```
ubuntu@zeku_server:/dev/hugepages $ cat /proc/meminfo  | grep Huge
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
FileHugePages:         0 kB
HugePages_Total:     256
HugePages_Free:      256
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:          524288 kB
ubuntu@zeku_server:/dev/hugepages $
```

为了与 hugetlb 对比性能差距，需要查看 cache miss数据
```
ubuntu@zeku_server:~/workspace/share/test_modules/memory/hugepage/hugetlb $ sudo perf stat -e dtlb_load_misses.miss_causes_a_walk ./a.out


 Performance counter stats for './a.out':

           109,129      dtlb_load_misses.miss_causes_a_walk

       1.194155646 seconds time elapsed

       0.149356000 seconds user
       0.076465000 seconds sys
```

### 使用 huge page
这里涉及到 `LD_PRELOAD`：
LD_PRELOAD，是个环境变量，用于动态库的加载，动态库加载的优先级最高，一般情况下，其加载顺序为LD_PRELOAD>LD_LIBRARY_PATH>/etc/ld.so.cache>/lib>/usr/lib。程序中我们经常要调用一些外部库的函数，以malloc为例，如果我们有个自定义的malloc函数，把它编译成动态库后，通过LD_PRELOAD加载，当程序中调用malloc函数时，调用的其实是我们自定义的函数，下面以一个例子说明。
参考[LD_PRELOAD用法](https://blog.csdn.net/iEearth/article/details/49952047)

使用 `libhugetlbfs.so` 重载 libc中的 一些函数。如 `malloc` `free` 等;
`HUGETLB_MORECORE` 是讲
```
LD_PRELOAD=libhugetlbfs.so HUGETLB_MORECORE=yes ./a.out
```

运行之后,查看 `/proc/meminfo`:
```
ubuntu@zeku_server:/dev/hugepages $ cat /proc/meminfo  | grep Huge
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
FileHugePages:         0 kB
HugePages_Total:     256
HugePages_Free:       58
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:          524288 kB
ubuntu@zeku_server:/dev/hugepages $
```


perf 查看 cache miss 等数据
```
ubuntu@zeku_server:~/workspace/share/test_modules/memory/hugepage/hugetlb $ export LD_PRELOAD=libhugetlbfs.so
ubuntu@zeku_server:~/workspace/share/test_modules/memory/hugepage/hugetlb $ export HUGETLB_MORECORE=yes
root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/share/test_modules/memory/hugepage/hugetlb# perf stat -e dtlb_load_misses.miss_causes_a_walk ./a.out


 Performance counter stats for './a.out':

             2,495      dtlb_load_misses.miss_causes_a_walk

       1.644226237 seconds time elapsed

       0.105609000 seconds user
       0.040619000 seconds sys


root@ubuntu-HP-ProDesk-680-G4-MT:/home/ubuntu/workspace/share/test_modules/memory/hugepage/hugetlb#
```

对比 `normal memory` `hugetlb` 两个场景时间:

`user time`
|  normal memory   | hugetlb  |
|  ----  | ----  |
| 0.149356000  | 0.105609000 |


`sys time`
|  normal memory   | hugetlb  |
|  ----  | ----  |
| 0.076465000  | 0.040619000 |

不管 `sys` `user` 时间，hugetlb 性能都是大大领先的。