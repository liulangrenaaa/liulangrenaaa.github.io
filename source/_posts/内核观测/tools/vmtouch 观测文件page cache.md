---
title: vmtouch 观测文件page cache
date: 2021-01-7 20:00:40
tags:
    - vmtouch
    - pagecache
categories:
    - linux内核
---


## vmtouch 介绍

`便携式文件系统缓存诊断和控制` 是 `vmtouch` 作者对于vmtouch的的定义。
首先他可以很方便的知道某一个文件当前有多少在 kernel memory 里面作为
`pagecache` 存在。

```
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch haha
           Files: 1
     Directories: 0
  Resident Pages: 11584/1024000  45M/3G  1.13%
         Elapsed: 0.031335 seconds
ubuntu@ubuntu-Inspiron-5548:~$
ubuntu@ubuntu-Inspiron-5548:~$
ubuntu@ubuntu-Inspiron-5548:~$ cat haha
^C
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch haha
           Files: 1
     Directories: 0
  Resident Pages: 36800/1024000  143M/3G  3.59%
         Elapsed: 0.033472 seconds
ubuntu@ubuntu-Inspiron-5548:~$
```

明显可以看到在经过 `cat` 访问之后 文件更多部分被读入 memory，作为 pagecache。


作者对于他的功能介绍：
```
1. 发现你的操作系统正在缓存哪些文件
2. 告诉操作系统缓存或清除某些文件或文件区域
3. 将文件锁定在内存中，这样操作系统就不会删除它们
4. 在服务器故障转移时保留虚拟内存配置文件
5. 保持“热备”文件服务器
6. 绘制文件系统缓存随时间的使用情况
7. 维护缓存使用的“软配额”
```



## vmtouch 使用

### 控制增加 pagecache

可以将整个文件读入内存，其实我们通过访问这个文件（从头到尾）也可以做到

```
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch -vt haha
haha
[OOo                                                         ] 44737/1024000
[OOOOOo                                                      ] 90849/1024000
[OOOOOOOOo                                                   ] 150209/1024000
[OOOOOOOOOOOOo                                               ] 215937/1024000
[OOOOOOOOOOOOOOOo                                            ] 271489/1024000
[OOOOOOOOOOOOOOOOOOOo                                        ] 326305/1024000
[OOOOOOOOOOOOOOOOOOOOOo                                      ] 370721/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOo                                   ] 414305/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOo                                ] 469697/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo                             ] 524289/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo                          ] 577153/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo                     ] 652481/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo                  ] 705953/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo               ] 757281/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo            ] 810593/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo        ] 876769/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo      ] 920545/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo  ] 973473/1024000
[OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO] 1024000/1024000


           Files: 1
     Directories: 0
   Touched Pages: 1024000 (3G)
         Elapsed: 9.4376 seconds
ubuntu@ubuntu-Inspiron-5548:~$
```


### 控制减少 pagecache

evict a file from memory
将一个文件的pagecache 从内存中移除
```
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch -ve haha
Evicting haha

           Files: 1
     Directories: 0
   Evicted Pages: 1024000 (3G)
         Elapsed: 0.085208 seconds
```

与`drop cache`不同，`vmtouch`做到了精准控制单个文件page_cache的效果，而 drop cache不行
```
root@ubuntu-Inspiron-5548:/home/ubuntu# echo 1 >  /proc/sys/vm/drop_caches
root@ubuntu-Inspiron-5548:/home/ubuntu# echo 3 >  /proc/sys/vm/drop_caches
```

### 保持文件在pagecache中

```
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch -dl haha
ubuntu@ubuntu-Inspiron-5548:~$ vmtouch: FATAL: mlock: haha (Cannot allocate memory)

ubuntu@ubuntu-Inspiron-5548:~$
```
(内存4G，文件4G 是没办法将文件常驻在 内存中的)
从此报错信息可以看出 `vmtouch` 也是通过 `mlock` 系统调用来实现 文件内容 或者 文件目录内容锁定在 内存中的








[vmtouch 作者的文章](https://hoytech.com/vmtouch/)


