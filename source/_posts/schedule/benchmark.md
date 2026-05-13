---
title: benchmark
date: 2021-6-01 19:00:00
tags:
    - linux kernel
categories:
    - linux kernel
    - linux schedule
---


参考[LWN文章](https://lwn.net/Articles/725238/)
## how to benchmark your linux system
参考
https://linuxconfig.org/how-to-benchmark-your-linux-system



## hackbench
`hackbench` 包含在 `rt-tests` 中，主要是 rt性能 的测试。
可以下载[源码](https://git.kernel.org/pub/scm/utils/rt-tests/rt-tests.git)编译安装
或者`rt-tests`安装包安装
```
ubuntu@zeku_server:/tmp/test $ sudo apt-cache search hackbench
rt-tests - Test programs for rt kernels
ubuntu@zeku_server:/tmp/test $
```

```
ubuntu@zeku_server:/tmp/test $ hackbench
Running in process mode with 10 groups using 40 file descriptors each (== 400 tasks)
Each sender will pass 100 messages of 100 bytes
Time: 0.093
ubuntu@zeku_server:/tmp/test $
```







## schbench
`schbench` 需要自己手动编译安装，地址在 [这里](https://git.kernel.org/pub/scm/linux/kernel/git/mason/schbench.git/tree/)
下载
```
git clone git://git.kernel.org/pub/scm/linux/kernel/git/mason/schbench.git
```

编译
```
ubuntu@zeku_server:/tmp/schbench $ ls
Makefile  schbench.c  schedstat.py
ubuntu@zeku_server:/tmp/schbench $
ubuntu@zeku_server:/tmp/schbench $ make
gcc -o schbench.o -c -Wall -O2 -g -W -D_GNU_SOURCE -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 schbench.c
gcc -Wall -O2 -g -W -D_GNU_SOURCE -D_LARGEFILE_SOURCE -D_FILE_OFFSET_BITS=64 -o schbench schbench.o -lpthread
ubuntu@zeku_server:/tmp/schbench $ ls
Makefile  schbench  schbench.c  schbench.o  schedstat.py
ubuntu@zeku_server:/tmp/schbench $
```

安装
```
ubuntu@zeku_server:/tmp/schbench $ ls
Makefile  schbench  schbench.c  schbench.o  schedstat.py
ubuntu@zeku_server:/tmp/schbench $ sudo mv schbench /usr/bin/
ubuntu@zeku_server:/tmp/schbench $ ls
Makefile  schbench.c  schbench.o  schedstat.py
ubuntu@zeku_server:/tmp/schbench $
```

测试结果
```
ubuntu@zeku_server:/tmp/schbench $ schbench

warmup done, zeroing stats
Latency percentiles (usec) runtime 10 (s) (1649 total samples)
	50.0th: 80 (833 samples)
	75.0th: 8040 (404 samples)
	90.0th: 14352 (248 samples)
	95.0th: 16016 (95 samples)
	*99.0th: 24992 (54 samples)
	99.5th: 28960 (7 samples)
	99.9th: 31968 (8 samples)
	min=4, max=31999
Latency percentiles (usec) runtime 20 (s) (4929 total samples)
	50.0th: 77 (2473 samples)
	75.0th: 8056 (1234 samples)
	90.0th: 14160 (735 samples)
	95.0th: 15824 (247 samples)
	*99.0th: 24736 (193 samples)
	99.5th: 28000 (24 samples)
	99.9th: 32032 (22 samples)
	min=3, max=39652
Latency percentiles (usec) runtime 30 (s) (8274 total samples)
	50.0th: 75 (4163 samples)
	75.0th: 8008 (2059 samples)
	90.0th: 14096 (1226 samples)
	95.0th: 15760 (415 samples)
	*99.0th: 24096 (329 samples)
	99.5th: 26976 (41 samples)
	99.9th: 31968 (34 samples)
	min=3, max=39652
ubuntu@zeku_server:/tmp/schbench $
```






## adrestia

`adrestia` 需要自己手动编译安装，地址在 [这里](https://github.com/mfleming/adrestia.git)

下载
```
git clone https://github.com/mfleming/adrestia.git
```

编译
```
ubuntu@zeku_server:/tmp/schbench/adrestia $ make
cc -Wall -lpthread -I /tmp/schbench/adrestia/include -g   -c -o wake.o wake.c
cc -Wall -lpthread -I /tmp/schbench/adrestia/include -g   -c -o stats.o stats.c
cc -Wall -lpthread -I /tmp/schbench/adrestia/include -g adrestia.c wake.o stats.o -o adrestia -lpthread
```

测试结果
```
ubuntu@zeku_server:/tmp/schbench/adrestia $ ./adrestia
wakeup cost (single): 11us
wakeup cost (periodic, 10us): 12us
ubuntu@zeku_server:/tmp/schbench/adrestia $
```










## rt-app

`rt-app` 需要自己手动编译安装，地址在 [这里](https://github.com/scheduler-tools/rt-app)

下载 编译 安装
```
git clone https://github.com/scheduler-tools/rt-app
```

也可以直接安装包安装
```
ubuntu@zeku_server:~/workspace/rt-tests $ sudo apt-cache search rt-app
pixelmed-webstart-apps - DICOM implementation containing Image Viewer and a ECG Viewer - jnlp
rt-app - Test application which simulates a real-time periodic load
```

guide 在 `rt-app/doc/tutorial.txt` 目录下，有几个比较重要的 配置：
```
"cpus" : [2,3], /*  set cpu affinity*/
.......
```

运行直接
```
rt-app tmp.json
```

利用rt-app 可以做很多场景的模拟，doc/example目录中有模拟 mp3 codec的json文件，
后续再研究。







## cyclictest
也是 `rt-tests` 中一个组件
```
ubuntu@zeku_server:~/workspace/rt-tests $ ./cyclictest --help
cyclictest V 2.30
Usage:
cyclictest <options>

-a [CPUSET] --affinity     Run thread #N on processor #N, if possible, or if CPUSET
                           given, pin threads to that set of processors in round-
                           robin order.  E.g. -a 2 pins all threads to CPU 2,
                           but -a 3-5,0 -t 5 will run the first and fifth
                           threads on CPU (0),thread #2 on CPU 3, thread #3
                           on CPU 4, and thread #5 on CPU 5.
-A USEC  --aligned=USEC    align thread wakeups to a specific offset
-b USEC  --breaktrace=USEC send break trace command when latency > USEC
-c CLOCK --clock=CLOCK     select clock
                           0 = CLOCK_MONOTONIC (default)
                           1 = CLOCK_REALTIME
         --default-system  Don't attempt to tune the system from cyclictest.
                           Power management is not suppressed.
                           This might give poorer results, but will allow you
                           to discover if you need to tune the system
-d DIST  --distance=DIST   distance of thread intervals in us, default=500
-D       --duration=TIME   specify a length for the test run.
                           Append 'm', 'h', or 'd' to specify minutes, hours or days.
-F       --fifo=<path>     create a named pipe at path and write stats to it
-h       --histogram=US    dump a latency histogram to stdout after the run
                           US is the max latency time to be tracked in microseconds
                           This option runs all threads at the same priority.
-H       --histofall=US    same as -h except with an additional summary column
         --histfile=<path> dump the latency histogram to <path> instead of stdout
-i INTV  --interval=INTV   base interval of thread in us default=1000
         --json=FILENAME   write final results into FILENAME, JSON formatted
         --laptop          Save battery when running cyclictest
                           This will give you poorer realtime results
                           but will not drain your battery so quickly
         --latency=PM_QOS  power management latency target value
                           This value is written to /dev/cpu_dma_latency
                           and affects c-states. The default is 0
-l LOOPS --loops=LOOPS     number of loops: default=0(endless)
         --mainaffinity=CPUSET
                           Run the main thread on CPU #N. This only affects
                           the main thread and not the measurement threads
-m       --mlockall        lock current and future memory allocations
-M       --refresh_on_max  delay updating the screen until a new max
                           latency is hit. Useful for low bandwidth.
-N       --nsecs           print results in ns instead of us (default us)
-o RED   --oscope=RED      oscilloscope mode, reduce verbose output by RED
-p PRIO  --priority=PRIO   priority of highest prio thread
         --policy=NAME     policy of measurement thread, where NAME may be one
                           of: other, normal, batch, idle, fifo or rr.
         --priospread      spread priority levels starting at specified value
-q       --quiet           print a summary only on exit
-r       --relative        use relative timer instead of absolute
-R       --resolution      check clock resolution, calling clock_gettime() many
                           times.  List of clock_gettime() values will be
                           reported with -X
         --secaligned [USEC] align thread wakeups to the next full second
                           and apply the optional offset
-s       --system          use sys_nanosleep and sys_setitimer
-S       --smp             Standard SMP testing: options -a -t and same priority
                           of all threads
        --spike=<trigger>  record all spikes > trigger
        --spike-nodes=[num of nodes]
                           These are the maximum number of spikes we can record.
                           The default is 1024 if not specified
         --smi             Enable SMI counting
-t       --threads         one thread per available processor
-t [NUM] --threads=NUM     number of threads:
                           without NUM, threads = max_cpus
                           without -t default = 1
         --tracemark       write a trace mark when -b latency is exceeded
-u       --unbuffered      force unbuffered output for live processing
-v       --verbose         output values on stdout for statistics
                           format: n:c:v n=tasknum c=count v=value in us
         --dbg_cyclictest  print info useful for debugging cyclictest
-x       --posix_timers    use POSIX timers instead of clock_nanosleep.
```


example:
```
ubuntu@zeku_server:~/workspace/linux-5.15 $ sudo cyclictest -t1 -p  -n -i 10000 -l 100
defaulting realtime priority to 2
# /dev/cpu_dma_latency set to 0us
policy: fifo: loadavg: 0.02 0.04 0.00 1/879 1758988

T: 0 (1758988) P: 2 I:10000 C:    100 Min:      3 Act:    4 Avg:    3 Max:       4
ubuntu@zeku_server:~/workspace/linux-5.15 $
```





## cpu benchmark


+ GeekBench
+ as

### geekbench
```
cd /tmp/
wget  http://cdn.geekbench.com/Geekbench-5.1.0-Linux.tar.gz
ls
tar -xzvf Geekbench-5.1.0-Linux.tar.gz
cd Geekbench-5.1.0-Linux
ls
```


## memory benchmark


参考[Realtime Testing Best Practices](https://elinux.org/Realtime_Testing_Best_Practices)