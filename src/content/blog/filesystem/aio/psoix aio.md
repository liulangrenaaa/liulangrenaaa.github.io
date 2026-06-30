---
title: psoix aio
date: 2021-07-27 19:00:40
tags:
    - psoix aio
categories:
    - linux内核
slug: "filesystem/aio/psoix-aio"
---



linux上的 aio 方案：
+ posix aio：posix 自己实现的 aio
+ native aio：内核5.1之前实现的aio，与 posix aio 相比性能更好，但是要求打开文件必须是O_DIRECT
+ io_uring: 5.1 版本之后实现的，配合 liburing 使用



## api
+ `aio_read`
+ `aio_write`
+ `aio_error`
+ `aio_cancel`
+ `aio_fsync`
+ `aio_return`
+ `aio_suspend`
+ `lio_listio`

`posix` 提供了很多 aio api，
```
int aio_read(struct aiocb *aiocbp);

       Link with -lrt.
```
编译链接时 需要添加 `-lrt`


## normal demo
```
void test_normal(struct aiocb *my_aiocb)
{
        int ret;

        ret = aio_read(my_aiocb);
        if (ret < 0) {
                printf("test_normal aio_read error.\n");
                return;
        }

        printf("test_normal aio_error = %d\n", aio_error(my_aiocb));

        while (aio_error(my_aiocb) == EINPROGRESS) {
                write(STDOUT_FILENO, ".", 1);
                sleep(1);
        }

        printf("test_normal content: %s\n", (char *)(my_aiocb->aio_buf));
        printf("test_normal aio_error=%d\n", aio_error(my_aiocb));
}

int main(void)
{
        int fd, ret;
        struct aiocb my_aiocb;

        memset(&my_aiocb, 0, sizeof(struct aiocb));

        my_aiocb.aio_buf = buf;
        my_aiocb.aio_fildes = STDIN_FILENO;
        my_aiocb.aio_nbytes = 64;
        my_aiocb.aio_offset = 0;

        test_normal(&my_aiocb);

        sleep(5);
        return 0;
}
```



## signal demo


```
void signal_handler(int sig, siginfo_t *info, void *ctx)
{
        int ret;
        struct aiocb *my_aiocb = (struct aiocb *)info->si_value.sival_ptr;

        printf("receive signal: %d\n", sig);

        while (aio_error(my_aiocb) == EINPROGRESS) {
                write(STDOUT_FILENO, ".", 1);
                sleep(1);
        }

        printf("signal_handler aio_error = %d errno = %d\n", aio_error(my_aiocb), errno);

        ret = aio_return(my_aiocb);
        if (ret < 0) {
                printf("signal_handler aio_return = %d\n", ret);
        }

        printf("signal_handler content: %s\n", (char *)(my_aiocb->aio_buf));
}

void test_signal(struct aiocb *my_aiocb)
{
        int ret;

        struct sigaction sa;
        sigemptyset(&sa.sa_mask);
        sa.sa_flags = SA_SIGINFO; // SA_RESTART, SA_NODEFER
        sa.sa_sigaction = signal_handler;
        sigaction(IO_SIGNAL, &sa, NULL);

        my_aiocb->aio_sigevent.sigev_notify = SIGEV_SIGNAL;
        my_aiocb->aio_sigevent.sigev_signo = IO_SIGNAL;
        my_aiocb->aio_sigevent.sigev_value.sival_ptr = my_aiocb;

        ret = aio_read(my_aiocb);
        if (ret < 0) {
                printf("test_signal aio_read() ret = %d\n", ret);
                return;
        }

        printf("test_signal aio_error = %d\n", aio_error(my_aiocb));

        printf("test_signal waiting for aio...\n");
        pause();
}

int main(void)
{
        int fd, ret;
        struct aiocb my_aiocb;

        memset(&my_aiocb, 0, sizeof(struct aiocb));

        my_aiocb.aio_buf = buf;
        my_aiocb.aio_fildes = STDIN_FILENO;
        my_aiocb.aio_nbytes = 64;
        my_aiocb.aio_offset = 0;

        test_signal(&my_aiocb);

        sleep(5);
        return 0;
}
```



## thread demo

```

void thread_handler(union sigval val)
{
        int ret;
        struct aiocb *my_aiocb = (struct aiocb *)val.sival_ptr;

        printf("thread handler()\n");

        while (aio_error(my_aiocb) == EINPROGRESS) {
                write(STDOUT_FILENO, ".", 1);
                sleep(1);
        }

        printf("thread_handler aio_error = %d\n", aio_error(my_aiocb));

        ret = aio_return(my_aiocb);
        if (ret < 0) {
                printf("thread_handler aio_return = %d\n", ret);
        }

        printf("thread_handler content: %s\n", (char *)(my_aiocb->aio_buf));
        //	printf("content: %s\n", buf);
}

void test_thread(struct aiocb *my_aiocb)
{
        int ret;
        const struct aiocb *aio_list[1] = {my_aiocb};

        my_aiocb->aio_sigevent.sigev_notify = SIGEV_THREAD;
        my_aiocb->aio_sigevent.sigev_notify_function = thread_handler;
        my_aiocb->aio_sigevent.sigev_value.sival_ptr = my_aiocb;

        ret = aio_read(my_aiocb);
        if (ret < 0) {
                printf("test_thread aio_read() ret = %d\n", ret);
                return;
        }

        printf("test_thread aio_error = %d\n", aio_error(my_aiocb));

        ret = aio_suspend(aio_list, 1, NULL);
        if (ret < 0) {
                printf("test_thread aio_suspend() ret = %d\n", ret);
                return;
        }

        printf("test_thread waiting for aio...\n");
}

int main()
{
        int fd, ret;
        struct aiocb my_aiocb;

        memset(&my_aiocb, 0, sizeof(struct aiocb));

        my_aiocb.aio_buf = buf;
        my_aiocb.aio_fildes = STDIN_FILENO;
        my_aiocb.aio_nbytes = 64;
        my_aiocb.aio_offset = 0;

        test_thread(&my_aiocb);

        sleep(5);
        return 0;
}
```





















