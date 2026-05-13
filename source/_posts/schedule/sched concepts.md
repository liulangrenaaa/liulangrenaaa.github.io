---
title: sched concepts
date: 2021-04-12 19:00:00
tags:
    - schedule
categories:
    - linux kernel
    - linux schedule
---


## EAS

what?
```
This patch series introduces Energy Aware Scheduling (EAS) for CFS tasks
on platforms with asymmetric CPU topologies (e.g. Arm big.LITTLE).
```
参考 [lkml EAS cover letter](https://lore.kernel.org/lkml/20181016101513.26919-1-quentin.perret@arm.com/)
参考 [lkml EAS overall design V5](https://marc.info/?l=linux-kernel&m=153243513908731&w=2)


## misfit

应该是指 task运行位置不合适：
运行 此 task需要的算力 比 当前 CPU or rq的最大算力还要高，实际代码里面使用的是
task需求算力  <  （CPU 最大算力 * 1.2）？

task需求算力如何计算：
uclamp_task_util(p)

```
/*
 * The margin used when comparing utilization with CPU capacity.
 *
 * (default: ~20%)
 */
#define fits_capacity(cap, max)	((cap) * 1280 < (max) * 1024)


static inline int task_fits_capacity(struct task_struct *p, long capacity)
{
	return fits_capacity(uclamp_task_util(p), capacity);
}



	if (task_fits_capacity(p, capacity_of(cpu_of(rq)))) {
		rq->misfit_task_load = 0;
		return;
	}
```




## utilization clamping

The main use-cases for utilization clamping are:

 - boosting: better interactive response for small tasks which
   are affecting the user experience.

   Consider for example the case of a small control thread for an external
   accelerator (e.g. GPU, DSP, other devices). Here, from the task utilization
   the scheduler does not have a complete view of what the task's requirements
   are and, if it's a small utilization task, it keeps selecting a more energy
   efficient CPU, with smaller capacity and lower frequency, thus negatively
   impacting the overall time required to complete task activations.

 - capping: increase energy efficiency for background tasks not affecting the
   user experience.

   Since running on a lower capacity CPU at a lower frequency is more energy
   efficient, when the completion time is not a main goal, then capping the
   utilization considered for certain (maybe big) tasks can have positive
   effects, both on energy consumption and thermal headroom.
   This feature allows also to make RT tasks more energy friendly on mobile
   systems where running them on high capacity CPUs and at the maximum
   frequency is not required.

参考 [LWN 文章-Add utilization clamping support](https://lwn.net/Articles/791682/)





## isolation

WHY?
```
Dedicating a CPU to a specific performance-critical process/task is desired.
```
需要将某些CPU 专用于 特定的性能关键的进程/任务。


HOW?
需要在boot的时候设置启动参数。
四核SMP系统上，加入需要 isolate CPU 0,1,2,3 中的 CPU2 与 CPU3，可以配置 kernel的启动参数

```
isolcpus=2,3
```

完整启动参数是
```
    sudo qemu-system-x86_64 \
	-kernel /home/ubuntu/workspace/share/stable/bzImage \
	-hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img \
	-append "root=/dev/sda5 console=ttyS0 crashkernel=256M isolcpus=2,3" \
	-smp 4 \
	-m 4096 \
	--enable-kvm \
	-net nic \
	-net user,hostfwd=tcp::2222-:22 \
	--nographic \
	-fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none \
	-device virtio-9p-pci,fsdev=fs1,mount_tag=host_share
```

一旦系统用这个参数启动，进程/任务将不会被分配给或从指定的CPU，除非通过taskset或cset命令分配进程到 isolate的CPU。
在Linux上，可以使用taskset命令设置进程的CPU亲和度，使用cset命令设置进程的CPU亲和度。

可以使用 taskset 设置task的 cpu 亲和性
查看某个进程的亲和性
```
ubuntu@wsl:~/workspace/linux-stable $ ps -aux | grep sleep
ubuntu    4445  0.0  0.0  15276   824 tty2     S    11:19   0:00 sleep 1000
ubuntu    4448  0.0  0.0  16208  1284 pts/0    S    11:19   0:00 grep --color=auto sleep
ubuntu@wsl:~/workspace/linux-stable $ taskset -c -p 4445
pid 4445's current affinity list: 0-11
```

设置某个进程的亲和性
```
ubuntu@wsl:~/workspace/linux-stable $ taskset -cp 1 4445
pid 4445's current affinity list: 0-11
pid 4445's new affinity list: 1
ubuntu@wsl:~/workspace/linux-stable $ taskset -c -p 4445
pid 4445's current affinity list: 1
ubuntu@wsl:~/workspace/linux-stable $
```

在server上实际测试结果：
```
测试环境：0-3共有四核 CPU，启动时 isolate出2-3俩核心。
1. 开机之后，0-1核 有正常task在跑，2-3核无任何 task。（此时task的 allow_cpumask都是 0-1）
2. userspace & kernelspace 的 cfs可以正常绑定到2-3核心，且可以正常跑
3. userspace 与 kernelspace 的rt 进程均可绑定到2-3核心，且可以正常跑
4. usespace 的 cfs绑定到0-3核心，可以跑到2-3核心上。
```
参考 [Suse 的官方文档](https://www.suse.com/support/kb/doc/?id=000017747)

