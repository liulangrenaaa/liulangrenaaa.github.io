---
title: linux native aio
date: 2021-07-27 19:00:40
tags:
    - linux native aio
categories:
    - linux内核
slug: "filesystem/aio/linux-native-aio"
---



## api
+ `io_setup`
+ `io_cancel`
+ `io_destroy`
+ `io_getevents`
+ `io_submit`

```
IO_SETUP(2)                                          Linux Programmer's Manual                                         IO_SETUP(2)

NAME
       io_setup - create an asynchronous I/O context
......
NOTES
       Glibc does not provide a wrapper function for this system call.  You could invoke it using syscall(2).   But  instead,  you
       probably want to use the io_setup() wrapper function provided by libaio.
```

open 打开文件的时候，必须要以 `O_DIRECT` 方式打开


## demo
```
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <errno.h>
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <time.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <libaio.h>

#define FILEPATH "/home/ubuntu/workspace/share/test_modules/filesystem/aio/kernel-aio/test.txt"

int main(void)
{
        io_context_t context;
        struct iocb io[2], *p[2] = {&io[0], &io[1]};
        struct io_event e[2];
        unsigned nr_events = 10;

        struct timespec timeout;
        timeout.tv_sec = 0;
        timeout.tv_nsec = 1000 * 1000 *10; //10ms

        char *wbuf = 0, *rbuf = 0;
        int wbuflen = 512 * 1024 * 1024;
        int rbuflen = wbuflen + 1;
        posix_memalign((void **)&wbuf, 512, wbuflen);
        posix_memalign((void **)&rbuf, 512, rbuflen);
        memset(wbuf, 'a', wbuflen);
        memset(rbuf, 0, rbuflen);
        memset(&context, 0, sizeof(io_context_t));

        int ret = 0, comp_num = 0, i = 0;

        int fd = open(FILEPATH, O_CREAT | O_RDWR | O_DIRECT, 0644);
        if (fd < 0) {
                printf("open file failed ！fd = %d\n", fd);
                return 0;
        }

        if (0 != io_setup(nr_events, &context)) {
                printf("io_setup error:%d\n", errno);
        }

        io_prep_pwrite(&io[0], fd, wbuf, wbuflen, 0);
        io_prep_pread(&io[1], fd, rbuf, rbuflen - 1, 0);

        if ((ret = io_submit(context, 2, p)) != 2) {
                printf("io_submit error:%d\n", ret);
                io_destroy(context);
                return -1;
        }

        while (true) {
                ret = io_getevents(context, 2, 2, e, &timeout);

                if (ret < 0) {
                        printf("io_getevents error:%d\n", ret);
                        break;
                } else if (ret > 0) {
                        comp_num += ret;
                        for (i = 0; i < ret; ++i) {
                                printf("result,res2:%d, res:%d\n", e[i].res2, e[i].res);
                        }
                }

                if (comp_num >= 2) {
                        printf("done !\n");
                        break;
                }
                printf("have not done !\n");
        }
        return 0;
}
```

编译 `gcc main.c -laio -D_GNU_SOURCE `







a
```
ubuntu@zeku_server:/tmp/123/2 $ touch d
ubuntu@zeku_server:/tmp/123/2 $ cd ../
ubuntu@zeku_server:/tmp/123 $ tree
.
├── 1
│   ├── a
│   └── b
└── 2
    ├── c
    └── d

2 directories, 4 files
ubuntu@zeku_server:/tmp/123 $
```





