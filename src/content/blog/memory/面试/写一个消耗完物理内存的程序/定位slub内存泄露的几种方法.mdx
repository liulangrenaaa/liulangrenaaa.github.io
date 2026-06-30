---
title: 定位slub内存泄露的几种方法
date: 2020-09-18 19:00:00
tags:
    - 内管管理
    - 内存泄露
    - bpftrace
    - ftrace
    - event trace
    - memleak
    - slub
categories:
    - linux内核
slug: "memory/面试/写一个消耗完物理内存的程序/定位slub内存泄露的几种方法"
---


总结一下最近最近遇到的内存泄露的一个bug，其实内核态的内存泄露还是比较难搞的，严重情况下基本只能重启设备解决，对于互联网公司来说大规模重启服务器来说代价有点大，有了一些工具我们还是比较容易观测到的，我用写了一个内核模块来模拟内核态的内存泄露，代码如下：
```
#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/version.h>
#include <linux/kthread.h>
#include <linux/delay.h>
#include <linux/slab.h>


#define LIULANGRENAAA_CACHE_SIZE  (5678)
static struct kmem_cache *liulangrenaaa_cache;
struct task_struct *task = NULL;

static int memleak_task_test(void *arg)
{
    int m = 1000 * 10;
    int n = 1000 * 20;
    int i = 0;
	gfp_t gfp = GFP_KERNEL;

    while(!kthread_should_stop()){
        i++;
        kmem_cache_alloc(liulangrenaaa_cache, gfp);
        if (i < m) {
            msleep_interruptible(50);
        } else if ((i > m) && (i < n)) {
            msleep_interruptible(500);
        } else if (i > n) {
            msleep_interruptible(5000);
        }
        if (i % 50 == 1) {
            printk(KERN_ERR "i = %d\n", i);
        }
    }

    return 0;
}

static int memleak_init(void)
{
    liulangrenaaa_cache = kmem_cache_create("liulangrenaaa_cache",
                LIULANGRENAAA_CACHE_SIZE, LIULANGRENAAA_CACHE_SIZE, SLAB_PANIC, NULL);
    if (liulangrenaaa_cache == NULL) {
        return 1;
    }
	task = kthread_run(memleak_task_test, NULL, "memleak_task_test");
	if (IS_ERR(task)) {
		printk(KERN_ERR "Ecard: unable to memleak_task_test kernel thread: %ld\n", PTR_ERR(task));
		return PTR_ERR(task);
	}

	return 0;
}

static void memleak_exit(void)
{
    if (NULL != task) {
        kthread_stop(task);
    }
    kmem_cache_destroy(liulangrenaaa_cache);
}

module_init(memleak_init);
module_exit(memleak_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("liulangrenaaa");
```

通过下面命令之后，安装内核模块
```
make
sudo insmod memleak.ko
```

过一段时间之后，就会发现内核内存不足，其中 `/proc/meminfo` 的 `SUnreclaim` 较大，且存在持续增加现象，这说明slab内存存在泄漏现象，属于典型的slab内存泄露

```
sh@ubuntu[root]:/sys/kernel/slab# cat /proc/meminfo
SReclaimable:     256132 kB
SUnreclaim:       897648 kB
```

```
sh@ubuntu[root]:/sys/kernel/slab# cat /proc/meminfo
SReclaimable:     256132 kB
SUnreclaim:       997652 kB
```

定位到slab内存泄露之后还不够，还需要了解到底是哪种slab内存泄露，linux内核提供了相关工具 `slabtop` `slabinfo`，可以观察内核中slab使用情况
```
sh@ubuntu[root]:/sys/kernel/slab# slabtop
 Active / Total Objects (% used)    : 1158388 / 1252082 (92.5%)
 Active / Total Slabs (% used)      : 27004 / 27004 (100.0%)
 Active / Total Caches (% used)     : 103 / 147 (70.1%)
 Active / Total Size (% used)       : 409641.83K / 438329.62K (93.5%)
 Minimum / Average / Maximum Object : 0.01K / 0.35K / 10.08K

  OBJS ACTIVE  USE OBJ SIZE  SLABS OBJ/SLAB CACHE SIZE NAME
204498 172768  84%    0.19K   4869       42     38952K dentry
134580 129007  95%    0.13K   2243       60     17944K kernfs_node_cache
122061 112693  92%    1.07K   4209       29    134688K ext4_inode_cache
 75348  61356  81%    0.10K   1932       39      7728K buffer_head
 61952  61952 100%    0.50K    968       64     30976K kmalloc-512
 61659  60140  97%    0.20K   1581       39     12648K vm_area_struct
 54144  53470  98%    0.03K    423      128      1692K kmalloc-32
 53184  51912  97%    0.06K    831       64      3324K anon_vma_chain
 45888  42616  92%    0.25K    717       64     11472K filp
 43232  35798  82%    0.57K    772       56     24704K radix_tree_node
 38743  35893  92%    0.59K    731       53     23392K inode_cache
 34960  34556  98%    0.09K    760       46      3040K anon_vma
 31872  26373  82%    0.06K    498       64      1992K kmalloc-64
 21248  21248 100%    0.02K     83      256       332K kmalloc-16
 19968  19968 100%    0.01K     39      512       156K kmalloc-8
 16320  12472  76%    0.04K    160      102       640K ext4_extent_status
 13200  12367  93%    0.66K    275       48      8800K proc_inode_cache
 13018  12877  98%    0.69K    283       46      9056K squashfs_inode_cache
 12070  12070 100%    0.05K    142       85       568K ftrace_event_field
```

```
sh@ubuntu[root]:/sys/kernel/slab# slabinfo
Name                   Objects Objsize           Space Slabs/Part/Cpu  O/S O %Fr %Ef Flg
........
dax_cache                   42     752           32.7K          0/0/1   42 3   0  96 Aa
dentry                   25537     192            6.1M     674/195/74   42 1  26  80 a
dma-kmalloc-512             64     512           32.7K          0/0/1   64 3   0 100 d
dmaengine-unmap-128         30    1056           32.7K          0/0/1   30 3   0  96 A
dmaengine-unmap-256         15    2080           32.7K          0/0/1   15 3   0  95 A
ext4_extent_status       12472      40          655.3K       151/61/9  102 0  38  76 a
ext4_groupinfo_4k         8008     144            1.1M        142/0/1   56 1   0  98 a
ext4_inode_cache          1131    1088            1.2M         32/0/7   29 3   0  96 a
ext4_system_zone           612      40           24.5K          2/0/4  102 0   0  99
fat_inode_cache             44     736           32.7K          0/0/1   44 3   0  98 a
file_lock_cache            148     216           32.7K          0/0/4   37 1   0  97
files_cache                276     704          196.6K          2/0/4   46 3   0  98 A
filp                      2213     256          720.8K       10/10/34   64 2  22  78 A
fuse_inode                  78     784           65.5K          0/0/2   39 3   0  93 Aa
fuse_request               112     144           16.3K          0/0/2   56 1   0  98
hugetlbfs_inode_cache      102     624           65.5K          0/0/2   51 3   0  97
inode_cache              22871     600           15.4M      442/47/30   53 3   9  88 a
jbd2_journal_head         2244     112          303.1K         4/4/33   68 1  10  82 a
jbd2_revoke_table_s        256      16            4.0K          0/0/1  256 0   0 100 a
kernfs_node_cache       129007     128           18.3M    2226/283/17   60 1  12  89
kmalloc-128               1536     128          196.6K        10/0/14   64 1   0 100
kmalloc-16               16128      16          258.0K        39/0/24  256 0   0 100
kmalloc-192               2184     192          425.9K        10/0/42   42 1   0  98
kmalloc-1k                2498    1024            2.7M       67/30/16   32 3  36  94
kmalloc-256               4224     256            1.0M        39/0/27   64 2   0 100
kmalloc-2k                2023    2048            4.2M       114/7/15   16 3   5  98
kmalloc-32               41694      32            1.3M      296/35/35  128 0  10  98
kmalloc-4k                1738    4096            7.4M      216/30/11    8 3  13  95
kmalloc-512              54016     512           27.6M       823/0/21   64 3   0 100
kmalloc-64               14637      64            1.2M     248/176/58   64 0  57  74
kmalloc-8                12800       8          102.4K        12/0/13  512 0   0 100
kmalloc-8k                 398    8192            3.4M         97/6/7    4 3   5  95
kmalloc-96                3738      96          364.5K        35/0/54   42 0   0  98
kmalloc-rcl-128            192     128           24.5K          0/0/3   64 1   0 100 a
kmalloc-rcl-64             384      64           24.5K          0/0/6   64 0   0 100 a
kmalloc-rcl-96             168      96           16.3K          0/0/4   42 0   0  98 a
kmem_cache                2149     408            1.0M       43/15/19   36 2  24  86 A
kmem_cache_node           2496      64          159.7K         9/0/30   64 0   0 100 A
liulangrenaaa_cache       26080    5678          228.5M        870/1/0    3 3   0  51 *
mm_struct                  120    1048          131.0K          0/0/4   30 3   0  95 A
mqueue_inode_cache          34     920           32.7K          0/0/1   34 3   0  95 A
names_cache                 72    4096          294.9K          0/0/9    8 3   0 100 A
net_namespace               18    4928           98.3K          0/0/3    6 3   0  90
numa_policy                186     264           49.1K          1/0/2   62 2   0  99
pde_opener                 408      40           16.3K          0/0/4  102 0   0  99
proc_dir_entry            1176     192          229.3K         20/0/8   42 1   0  98
proc_inode_cache          1789     672            1.3M         5/5/37   48 3  11  87 a
radix_tree_node           6181     576            6.5M     177/149/22   56 3  74  54 a
RAW                        641     976          819.2K        13/5/12   32 3  20  76 A
RAWv6                      494    1176          622.5K         5/0/14   26 3   0  93 A
request_queue               60    2104          131.0K          0/0/4   15 3   0  96
request_sock_TCP           212     296           65.5K          0/0/4   53 2   0  95
scsi_sense_cache          1536      96          196.6K         21/0/3   64 1   0  75 A
........
```
在 `slabinfo` 的输出中明显看到 `liulangrenaaa` 的slab使用有异常，size为 5678，使用的个数高达26080，总内存占用是 228.5M，看来我们是找到了内存泄露的真凶了。

找到 `liulangrenaaa` 这个slab内存泄露之后，如何从代码上找到内存泄露的源头呢。
我的一般做法是
1. 直接在代码中搜索 liulangrenaaa 看slab的创建，根据创建的名字再去搜索 alloc 和 free的代码，对于我抽象的这个例子来说直接就可以看出端倪，有时候在复杂的代码逻辑想找出分配但没有释放的点是比较困难的
2. 根据 liulangrenaaa slab 的 size，直接使用 bpftrace 来跟踪 kmem_cache_alloc 和 kmem_cache_free 函数且参数 size和我们相符的点，将comm 和 pid打印出来，基本是一把就能确定是谁在泄露这个slab，需要依赖bpftrace
3. ftrace 来跟踪所有的 kmem_cache_alloc 和 kmem_cache_free点，然后将trace保存下来一一去对比，这个方法类似于方法二，但是工作量很大，因为ftrace不能过滤参数
4. 使用kmemleak工具检查内存泄露，但是这种方法需要内核支持，如果不支持可能需要重新编译内核，大服务器上工作量有点大，嵌入式系统中还好
5. 使用slub_debug 这个特性，但是也需要内核支持，同方法4

## 使用bpftrace来过滤
首先要知道slab的分配和释放接口是 `kmem_cache_alloc` `kmem_cache_free`,然后去寻找 内核有没有提供 tracepoint点或者可以krpobe的点

```
sh@ubuntu[root]:/sys/kernel/slab# bpftrace -l | grep trace  |grep mem | grep alloc
tracepoint:kmem:kmalloc
tracepoint:kmem:kmem_cache_alloc
tracepoint:kmem:kmalloc_node
tracepoint:kmem:kmem_cache_alloc_node
tracepoint:kmem:mm_page_alloc
tracepoint:kmem:mm_page_alloc_zone_locked
tracepoint:kmem:mm_page_alloc_extfrag

sh@ubuntu[root]:/sys/kernel/slab# bpftrace -l | grep trace  |grep mem | grep free
tracepoint:kmem:kfree
tracepoint:kmem:kmem_cache_free
tracepoint:kmem:mm_page_free
tracepoint:kmem:mm_page_free_batched
```
幸运的是发现内核居然都提供了这两个tracepoint点，然后需要去观察一下这两个tracepoint点可以给我们带来什么信息，直接到 `/sys/kernel/debug/tracing/events/` 目录下看一下
```
sh@ubuntu[root]:/sys/kernel/debug/tracing/events# cat kmem/kmem_cache_alloc/format
name: kmem_cache_alloc
ID: 539
format:
	field:unsigned short common_type;	offset:0;	size:2;	signed:0;
	field:unsigned char common_flags;	offset:2;	size:1;	signed:0;
	field:unsigned char common_preempt_count;	offset:3;	size:1;	signed:0;
	field:int common_pid;	offset:4;	size:4;	signed:1;

	field:unsigned long call_site;	offset:8;	size:8;	signed:0;
	field:const void * ptr;	offset:16;	size:8;	signed:0;
	field:size_t bytes_req;	offset:24;	size:8;	signed:0;
	field:size_t bytes_alloc;	offset:32;	size:8;	signed:0;
	field:gfp_t gfp_flags;	offset:40;	size:4;	signed:0;
```

可以看到 `bytes_req` 就是申请的slab大小，下面我们使用bpftrace来跟踪这个tp点，加上条件限制
```
sh@ubuntu[root]:/sys/kernel/slab# bpftrace -e 'tracepoint:kmem:kmem_cache_alloc / args->bytes_req == 5678 / { printf("pid:%d, comm:%s, kstack:[%s]\n", pid, comm, kstack);}'
Attaching 1 probe...
pid:40953, comm:memleak_task_te, kstack:[
        kmem_cache_alloc+340
        kmem_cache_alloc+340
        memleak_task_test+112
        kthread+260
        ret_from_fork+53
]
pid:40953, comm:memleak_task_te, kstack:[
        kmem_cache_alloc+340
        kmem_cache_alloc+340
        memleak_task_test+112
        kthread+260
        ret_from_fork+53
]
sh@ubuntu[root]:/sys/kernel/debug/tracing/events# ps -aux |grep 40953
root       40953  0.0  0.0      0     0 ?        S    14:17   0:00 [memleak_task_te]
root       40958  0.0  0.0  17668   736 pts/4    S+   14:18   0:00 grep --color=auto 40953
```
根据内核线程名 `memleak_task_te` 就可以直接在代码中搜索，再结合 `kstack` 基本就可以直接找到bug

## 使用ftrace来跟踪
其实和上面bpftrace 使用的原理是一样的，但是bpftrace 对内核版本要求较高，很多centos服务器的版本都比较老，甚至还在2.6.32左右，这样bpftrace基本不能用，所以ftrace一直很热门
同样也需要找到分配释放slab的接口，也需要知道有没有提供相关tracepoint点，上面bpftrace方法已经说了，不赘述。
```
sh@ubuntu[root]:/sys/kernel/debug/tracing# echo 1 > events/kmem/kmem_cache_alloc/enable
sh@ubuntu[root]:/sys/kernel/debug/tracing# cat trace
# tracer: nop
#
# entries-in-buffer/entries-written: 348/348   #P:4
#
#                              _-----=> irqs-off
#                             / _----=> need-resched
#                            | / _---=> hardirq/softirq
#                            || / _--=> preempt-depth
#                            ||| /     delay
#           TASK-PID   CPU#  ||||    TIMESTAMP  FUNCTION
#              | |       |   ||||       |         |
          <idle>-0     [003] ..s. 312444.111637: kmem_cache_alloc: call_site=__build_skb+0x24/0x60 ptr=0000000003218205 bytes_req=224 bytes_alloc=256 gfp_flags=GFP_ATOMIC
           <...>-39771 [000] .... 312444.141944: kmem_cache_alloc: call_site=getname_flags+0x4f/0x1f0 ptr=00000000873301d3 bytes_req=4096 bytes_alloc=4096 gfp_flags=GFP_KERNEL
           <...>-39771 [000] .... 312444.141956: kmem_cache_alloc: call_site=__alloc_file+0x28/0x110 ptr=000000003ce0135a bytes_req=256 bytes_alloc=256 gfp_flags=GFP_KERNEL|__GFP_ZERO
           <...>-39771 [000] .... 312444.141957: kmem_cache_alloc: call_site=security_file_alloc+0x29/0x90 ptr=00000000142c82a3 bytes_req=24 bytes_alloc=24 gfp_flags=GFP_KERNEL|__GFP_ZERO
           <...>-39771 [000] .... 312444.342794: kmem_cache_alloc: call_site=getname_flags+0x4f/0x1f0 ptr=00000000873301d3 bytes_req=4096 bytes_alloc=4096 gfp_flags=GFP_KERNEL
           <...>-39771 [000] .... 312444.342800: kmem_cache_alloc: call_site=__alloc_file+0x28/0x110 ptr=000000003ce0135a bytes_req=256 bytes_alloc=256 gfp_flags=GFP_KERNEL|__GFP_ZERO
```
这样的信息对我们来说实在是太多了，我们知道trace保存这些信息的其实是一个 ringbuffer，短时间这么多的信息肯定会一遍一遍的填充这个 ringbufer，往往其中也没几条我们想要的信息，这就轮到filter上场了，可以根据规则想 filter 中写入相应规则，过滤我们想要trace的事件

```
sh@ubuntu[root]:/sys/kernel/debug/tracing/events/kmem/kmem_cache_alloc# ls
enable  filter  format  hist  id  trigger
sh@ubuntu[root]:/sys/kernel/debug/tracing# echo "bytes_req == 5678" > events/kmem/kmem_cache_alloc/filter
sh@ubuntu[root]:/sys/kernel/debug/tracing# cat events/kmem/kmem_cache_alloc/filter
bytes_req == 5678
sh@ubuntu[root]:/sys/kernel/debug/tracing# echo 0 > trace
sh@ubuntu[root]:/sys/kernel/debug/tracing# cat trace
# tracer: nop
#
# entries-in-buffer/entries-written: 0/0   #P:4
#
#                              _-----=> irqs-off
#                             / _----=> need-resched
#                            | / _---=> hardirq/softirq
#                            || / _--=> preempt-depth
#                            ||| /     delay
#           TASK-PID   CPU#  ||||    TIMESTAMP  FUNCTION
#              | |       |   ||||       |         |
sh@ubuntu[root]:/sys/kernel/debug/tracing# echo 1 > events/kmem/kmem_cache_alloc/enable
sh@ubuntu[root]:/sys/kernel/debug/tracing# cat trace
# tracer: nop
#
# entries-in-buffer/entries-written: 55/55   #P:4
#
#                              _-----=> irqs-off
#                             / _----=> need-resched
#                            | / _---=> hardirq/softirq
#                            || / _--=> preempt-depth
#                            ||| /     delay
#           TASK-PID   CPU#  ||||    TIMESTAMP  FUNCTION
#              | |       |   ||||       |         |
           <...>-41112 [002] .... 313039.418842: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=00000000844671fe bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.477171: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=00000000157b6ef2 bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.537008: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=00000000a69f35fe bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.597138: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=00000000b724443c bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.656971: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=000000003b39979a bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.716942: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=000000009a7e8ccf bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.777130: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=0000000088be3316 bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.837584: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=00000000b53a68b4 bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
           <...>-41112 [002] .... 313039.896236: kmem_cache_alloc: call_site=memleak_task_test+0x70/0xb0 [memleak] ptr=000000004173b1a7 bytes_req=5678 bytes_alloc=10320 gfp_flags=GFP_KERNEL
sh@ubuntu[root]:/sys/kernel/debug/tracing# ps -aux | grep 41112
root       41112  0.0  0.0      0     0 ?        S    14:36   0:00 [memleak_task_te]
root       41119  0.0  0.0  17668   724 pts/4    S+   14:37   0:00 grep --color=auto 41112
```
ftrace的 event tracing 功能也可以实现类似和 bpftrace的功能，但是不能看到 kstack。
看到泄露 slab的内核线程后面的工作也比较好做了，可以通过 proc接口查看stack，虽然这种方法看到的stack不是问题线程的stack，但是也有一些帮助
```
sh@ubuntu[root]:/proc/41112# cat stack
[<0>] msleep_interruptible+0x30/0x60
[<0>] memleak_task_test+0x82/0xb0 [memleak]
[<0>] kthread+0x104/0x140
[<0>] ret_from_fork+0x35/0x40
```

相关 event trace的其他方法详见
[Event Trace Doc](https://www.kernel.org/doc/html/v4.18/trace/events.html)

## 使用memleak来定位
如果发现内核中有 memleak 现象直接 `cat /sys/kernel/debug/kmemleak`
这是内核每过一段时间救过自动扫描内核空间然后检查出来的memleak，
当然也可以手动触发kmemleak检查 `echo scan /sys/kernel/debug/kmemleak`
```
sh@ubuntu[root]:/sys/kernel/debug# cat kmemleak
unreferenced object 0xffff8ea54df1a990 (size 5678):
  comm "memleak_task_te", pid 4246, jiffies 4295117333 (age 199.916s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<0000000044bb737d>] kmem_cache_alloc+0xec/0x260
    [<00000000adf25388>] 0xffffffffc08ea070
    [<00000000ba36b6c9>] kthread+0x104/0x140
    [<00000000c2aa164b>] ret_from_fork+0x3a/0x50
unreferenced object 0xffff8ea54df1d310 (size 5678):
  comm "memleak_task_te", pid 4246, jiffies 4295117349 (age 199.852s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<0000000044bb737d>] kmem_cache_alloc+0xec/0x260
    [<00000000adf25388>] 0xffffffffc08ea070
    [<00000000ba36b6c9>] kthread+0x104/0x140
    [<00000000c2aa164b>] ret_from_fork+0x3a/0x50
unreferenced object 0xffff8ea54df18010 (size 5678):
  comm "memleak_task_te", pid 4246, jiffies 4295117364 (age 199.792s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<0000000044bb737d>] kmem_cache_alloc+0xec/0x260
    [<00000000adf25388>] 0xffffffffc08ea070
    [<00000000ba36b6c9>] kthread+0x104/0x140
    [<00000000c2aa164b>] ret_from_fork+0x3a/0x50
unreferenced object 0xffff8ea548de5310 (size 5678):
  comm "memleak_task_te", pid 4246, jiffies 4295117379 (age 199.732s)
  hex dump (first 32 bytes):
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
    6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
  backtrace:
    [<0000000044bb737d>] kmem_cache_alloc+0xec/0x260
    [<00000000adf25388>] 0xffffffffc08ea070
    [<00000000ba36b6c9>] kthread+0x104/0x140
    [<00000000c2aa164b>] ret_from_fork+0x3a/0x50
```
这是我内核模块卸载之后打印的kstack，可以根据comm线程名字来找出 kmemleak 的内鬼真凶。

kmemleak的原理可以参考内核文档 [kmemleak 实现原理](https://www.kernel.org/doc/html/latest/dev-tools/kmemleak.html)

## 使用slub_debug来定位
在打开 slub_debug的情况下，定位到 liulangrenaaa_cache slab 泄露之后，可以trace这个slab的分配行为。
需要打开内核编译选项，只有slub有这个trace功能，slab slob没有
```
+CONFIG_SLUB_DEBUG=y
+CONFIG_SLUB_DEBUG_ON=y
```
重新编译内核之后，使能slub trace
```
sh@ubuntu[root]:~# echo 1 > /sys/kernel/slab/liulangrenaaa_cache/trace
sh@ubuntu[root]:~# sleep 1
sh@ubuntu[root]:~# echo 0 > /sys/kernel/slab/liulangrenaaa_cache/trace
sh@ubuntu[root]:~# dmesg | tail
```
观察kmesg输出，每次分配，释放都会被trace下来，最后destory也会，如果在没有完全释放所有分配的slub之前destory slub 就会产生一个bug警告
```
[ 2109.158214] TRACE liulangrenaaa_cache alloc 0x00000000459b1c3f inuse=3 fp=0x0000000000000000
[ 2109.158217] CPU: 0 PID: 4561 Comm: memleak_task_te Kdump: loaded Tainted: G           OE     5.4.44 #2
[ 2109.158217] Hardware name: VMware, Inc. VMware Virtual Platform/440BX Desktop Reference Platform, BIOS 6.00 07/29/2019
[ 2109.158218] Call Trace:
[ 2109.158221]  dump_stack+0x98/0xda
[ 2109.158224]  alloc_debug_processing.cold+0x53/0x72
[ 2109.158225]  ___slab_alloc+0x506/0x590
[ 2109.158226]  ? memleak_task_test+0x70/0xb0 [memleak]
[ 2109.158227]  ? kmem_cache_alloc+0x23e/0x260
[ 2109.158228]  ? memleak_task_test+0x70/0xb0 [memleak]
[ 2109.158229]  ? memleak_task_test+0x70/0xb0 [memleak]
[ 2109.158230]  __slab_alloc+0x51/0x90
[ 2109.158231]  kmem_cache_alloc+0x23e/0x260
[ 2109.158232]  ? memleak_task_test+0x70/0xb0 [memleak]
[ 2109.158233]  memleak_task_test+0x70/0xb0 [memleak]
[ 2109.158234]  kthread+0x104/0x140
[ 2109.158235]  ? 0xffffffffc08ea000
[ 2109.158236]  ? kthread_park+0x90/0x90
[ 2109.158237]  ret_from_fork+0x3a/0x50
[ 2109.238159] =============================================================================
[ 2109.238162] BUG liulangrenaaa_cache (Tainted: G           OE    ): Objects remaining in liulangrenaaa_cache on __kmem_cache_shutdown()
[ 2109.238171] -----------------------------------------------------------------------------

[ 2109.238172] Disabling lock debugging due to kernel taint
[ 2109.238173] INFO: Slab 0x000000001be073de objects=3 used=2 fp=0x00000000fd86908a flags=0xfffffc0010200
[ 2109.238176] CPU: 1 PID: 4580 Comm: rmmod Kdump: loaded Tainted: G    B      OE     5.4.44 #2
[ 2109.238176] Hardware name: VMware, Inc. VMware Virtual Platform/440BX Desktop Reference Platform, BIOS 6.00 07/29/2019
[ 2109.238177] Call Trace:
[ 2109.238180]  dump_stack+0x98/0xda
[ 2109.238183]  slab_err+0xb7/0xdc
[ 2109.238184]  __kmem_cache_shutdown.cold+0x1b/0x121
[ 2109.238186]  shutdown_cache+0x16/0x160
[ 2109.238187]  kmem_cache_destroy+0x21c/0x240
[ 2109.238189]  memleak_exit+0x26/0x28 [memleak]
[ 2109.238191]  __x64_sys_delete_module+0x147/0x2b0
[ 2109.238192]  ? entry_SYSCALL_64_after_hwframe+0x49/0xbe
[ 2109.238193]  ? trace_hardirqs_on+0x38/0xf0
[ 2109.238195]  do_syscall_64+0x5f/0x1a0
[ 2109.238196]  entry_SYSCALL_64_after_hwframe+0x49/0xbe
[ 2109.238197] RIP: 0033:0x7f78838e7a3b
[ 2109.238199] Code: 73 01 c3 48 8b 0d 55 84 0c 00 f7 d8 64 89 01 48 83 c8 ff c3 66 2e 0f 1f 84 00 00 00 00 00 90 f3 0f 1e fa b8 b0 00 00 00 0f 05 <48> 3d 01 f0 ff ff 73 01 c3 48 8b 0d 25 84 0c 00 f7 d8 64 89 01 48
[ 2109.238199] RSP: 002b:00007ffda198cbf8 EFLAGS: 00000206 ORIG_RAX: 00000000000000b0
[ 2109.238200] RAX: ffffffffffffffda RBX: 000055a871197790 RCX: 00007f78838e7a3b
[ 2109.238201] RDX: 000000000000000a RSI: 0000000000000800 RDI: 000055a8711977f8
[ 2109.238201] RBP: 00007ffda198cc58 R08: 0000000000000000 R09: 0000000000000000
[ 2109.238201] R10: 00007f7883963ac0 R11: 0000000000000206 R12: 00007ffda198ce30
[ 2109.238202] R13: 00007ffda198e752 R14: 000055a8711972a0 R15: 000055a871197790
[ 2109.238204] INFO: Object 0x00000000459b1c3f @offset=16
[ 2109.238205] INFO: Allocated in memleak_task_test+0x70/0xb0 [memleak] age=20 cpu=0 pid=4561
[ 2109.238206] 	__slab_alloc+0x51/0x90
[ 2109.238207] 	kmem_cache_alloc+0x23e/0x260
[ 2109.238208] 	memleak_task_test+0x70/0xb0 [memleak]
[ 2109.238209] 	kthread+0x104/0x140
[ 2109.238210] 	ret_from_fork+0x3a/0x50
[ 2109.238211] INFO: Object 0x00000000f693e050 @offset=10640
[ 2109.238212] INFO: Allocated in memleak_task_test+0x70/0xb0 [memleak] age=35 cpu=0 pid=4561
[ 2109.238213] 	__slab_alloc+0x51/0x90
[ 2109.238214] 	kmem_cache_alloc+0x23e/0x260
[ 2109.238215] 	memleak_task_test+0x70/0xb0 [memleak]
[ 2109.238215] 	kthread+0x104/0x140
[ 2109.238216] 	ret_from_fork+0x3a/0x50
[ 2109.238219] kmem_cache_destroy liulangrenaaa_cache: Slab cache still has objects
[ 2109.238221] CPU: 1 PID: 4580 Comm: rmmod Kdump: loaded Tainted: G    B      OE     5.4.44 #2
[ 2109.238221] Hardware name: VMware, Inc. VMware Virtual Platform/440BX Desktop Reference Platform, BIOS 6.00 07/29/2019
[ 2109.238221] Call Trace:
[ 2109.238222]  dump_stack+0x98/0xda
[ 2109.238223]  kmem_cache_destroy.cold+0x15/0x1a
[ 2109.238224]  memleak_exit+0x26/0x28 [memleak]
[ 2109.238225]  __x64_sys_delete_module+0x147/0x2b0
[ 2109.238226]  ? entry_SYSCALL_64_after_hwframe+0x49/0xbe
[ 2109.238227]  ? trace_hardirqs_on+0x38/0xf0
[ 2109.238228]  do_syscall_64+0x5f/0x1a0
[ 2109.238229]  entry_SYSCALL_64_after_hwframe+0x49/0xbe
[ 2109.238229] RIP: 0033:0x7f78838e7a3b
[ 2109.238230] Code: 73 01 c3 48 8b 0d 55 84 0c 00 f7 d8 64 89 01 48 83 c8 ff c3 66 2e 0f 1f 84 00 00 00 00 00 90 f3 0f 1e fa b8 b0 00 00 00 0f 05 <48> 3d 01 f0 ff ff 73 01 c3 48 8b 0d 25 84 0c 00 f7 d8 64 89 01 48
[ 2109.238230] RSP: 002b:00007ffda198cbf8 EFLAGS: 00000206 ORIG_RAX: 00000000000000b0
[ 2109.238238] RAX: ffffffffffffffda RBX: 000055a871197790 RCX: 00007f78838e7a3b
[ 2109.238239] RDX: 000000000000000a RSI: 0000000000000800 RDI: 000055a8711977f8
[ 2109.238239] RBP: 00007ffda198cc58 R08: 0000000000000000 R09: 0000000000000000
[ 2109.238240] R10: 00007f7883963ac0 R11: 0000000000000206 R12: 00007ffda198ce30
[ 2109.238240] R13: 00007ffda198e752 R14: 000055a8711972a0 R15: 000055a871197790
```