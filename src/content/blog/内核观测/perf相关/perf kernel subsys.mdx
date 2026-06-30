---
title: perf kernel subsys
date: 2021-07-15 19:00:40
tags:
    - perf
    - filesystem
categories:
    - linux内核
slug: "内核观测/perf相关/perf-kernel-subsys"
---


## perf 架构
perf的基本包装模型是这样的，对每一个event分配一个对应的perf_event结构。所有对event的操作都是围绕perf_event来展开的：

通过perf_event_open系统调用分配到perf_event以后，会返回一个文件句柄fd，这样这个perf_event结构可以通过read/write/ioctl/mmap通用文件接口来操作。
perf_event提供两种类型的trace数据：count和sample。count只是记录了event的发生次数，sample记录了大量信息(比如：IP、ADDR、TID、TIME、CPU、BT)。如果需要使用sample功能，需要给perf_event分配ringbuffer空间，并且把这部分空间通过mmap映射到用户空间。这和定位问题时从粗到细的思路是相符的，首先从counter的比例上找出问题热点在哪个模块，再使用详细记录抓取更多信息来进一步定位。具体分别对应“perf stat”和“perf record/report”命令。
perf的开销应该是比ftrace要大的，因为它给每个event都独立一套数据结构perf_event，对应独立的attr和pmu。在数据记录时的开销肯定大于ftrace，但是每个event的ringbuffer是独立的所以也不需要ftrace复杂的ringbuffer操作。perf也有比ftrace开销小的地方，它的sample数据存储的ringbuffer空间会通过mmap映射到到用户态，这样在读取数据的时候就会少一次拷贝。不过perf的设计初衷也不是让成百上千的event同时使用，只会挑出一些event重点debug。

## pmu 硬件
performance monitor unit

### arm
arm 有很多pmu，大致分为 普通PMU、DSU-PMU、SPE-PMU、SMMU-PMU等。

SPE(Statistical Profiling Extension (SPE) Performance Monitor Units):
```
spe-pmu {
        compatible = "arm,statistical-profiling-extension-v1";
        interrupts = <GIC_PPI 05 IRQ_TYPE_LEVEL_HIGH &part1>;
};
```
参考[spe-pmu](https://github.com/torvalds/linux/blob/master/Documentation/devicetree/bindings/arm/spe-pmu.txt)


DSU(DynamIQ Shared Unit (DSU) Performance Monitor Unit):
```
dsu-pmu-0 {
	compatible = "arm,dsu-pmu";
	interrupts = <GIC_SPI 02 IRQ_TYPE_LEVEL_HIGH>;
	cpus = <&cpu_0>, <&cpu_1>;
};
```
参考[dsu-pmu](https://github.com/torvalds/linux/blob/master/Documentation/devicetree/bindings/arm/arm-dsu-pmu.txt)


#### arm v9 2021 新feature
+ Branch events
+ Bulk memory operations
+ Stall events
+ Atomics events
+ Data source or target (cache hit) events
+ Cache line state tracking
+ TLB events
+ Latency events


#### SPE 的扩展
+ Counter packet size
+ Hardware management of the dirty state and Access Flag
+ External abort handling
+ Second address packet generation
+ Sampling Tag operations
+ Sampling memory copy/set operations



#### Trace and Branch Recording Extensions
+ Hardware management of the dirty state and Access Flag
+ External abort handling
+ Trace Architecture updates for the 2021 Architecture Extensions
+ Self-hosted branch recording of EL3 using BRBE


## perf 软件结构


```
                           +-----------------+
                           |                 |
                           |    Application  |
 userspace                 +-----------------+

                     +-----------------------------+
                     |                             |
                     |          perf               |
                     |                             |
                     +-----------------------------+

---------------------------------------------------------------------------------------------------

            +------------------------+      +-------------------------------------+
            |                        +----->|                                     |
            |   kernel/event/core.c  |      | arch/arm64/kernel/perf_event.c      |
            +------------------------+<-----+                                     |
kernelspace                                 +-------------------------------------+


           +-----------------------------------------------------+
           |                                                     |
           |                   PMU counters                      |
           |                                                     |
           +-----------------------------------------------------+
```

+ userspace perf 代码在 `tools/perf` 目录下
+ kernelspace perf 框架代码在 `kernel/events` 目录下，`kernel/Makefile` 中可以看出
events目录都是和 perf相关的
```
obj-$(CONFIG_PERF_EVENTS) += events/
```

+ arm64 架构相关代码在 `arch/arm64/kernel/perf_event.c` 中，`arch/arm64/kernel/Makefile` 可以看出
```
obj-$(CONFIG_PERF_EVENTS)		+= perf_regs.o perf_callchain.o
obj-$(CONFIG_HW_PERF_EVENTS)		+= perf_event.o
```

+ arm 相关drivers 代码在 `drivers/perf` 目录中
`drivers/perf/Makefile` 可以看到如下各种 PMU CONFIG，有`DSU` `SPE` 等
```
obj-$(CONFIG_ARM_CCI_PMU) += arm-cci.o
obj-$(CONFIG_ARM_CCN) += arm-ccn.o
obj-$(CONFIG_ARM_CMN) += arm-cmn.o
obj-$(CONFIG_ARM_DSU_PMU) += arm_dsu_pmu.o
obj-$(CONFIG_ARM_PMU) += arm_pmu.o arm_pmu_platform.o
obj-$(CONFIG_ARM_PMU_ACPI) += arm_pmu_acpi.o
obj-$(CONFIG_ARM_SMMU_V3_PMU) += arm_smmuv3_pmu.o
obj-$(CONFIG_FSL_IMX8_DDR_PMU) += fsl_imx8_ddr_perf.o
obj-$(CONFIG_HISI_PMU) += hisilicon/
obj-$(CONFIG_QCOM_L2_PMU)	+= qcom_l2_pmu.o
obj-$(CONFIG_QCOM_L3_PMU) += qcom_l3_pmu.o
obj-$(CONFIG_THUNDERX2_PMU) += thunderx2_pmu.o
obj-$(CONFIG_XGENE_PMU) += xgene_pmu.o
obj-$(CONFIG_ARM_SPE_PMU) += arm_spe_pmu.o
obj-$(CONFIG_ARM_DMC620_PMU) += arm_dmc620_pmu.o
```


## perf init
`perf_event_init`注册不同 类型(sw)的 `pmu`，
如`perf_swevent`，`perf_tracepoint`，`perf_kprobe`，`perf_uprobe`，`perf_cpu_clock`等

```
void __init perf_event_init(void)
{
	perf_event_init_all_cpus();
	init_srcu_struct(&pmus_srcu);
	perf_pmu_register(&perf_swevent, "software", PERF_TYPE_SOFTWARE);
	perf_pmu_register(&perf_cpu_clock, NULL, -1);
	perf_pmu_register(&perf_task_clock, NULL, -1);
	perf_tp_register();
	perf_event_init_cpu(smp_processor_id());
	register_reboot_notifier(&perf_reboot_notifier);

	ret = init_hw_breakpoint();
	WARN(ret, "hw_breakpoint initialization failed with: %d", ret);

	perf_event_cache = KMEM_CACHE(perf_event, SLAB_PANIC);
    ......
}
```


arm 硬件架构相关的`pmu` 注册在
```
static const struct of_device_id armv8_pmu_of_device_ids[] = {
	{.compatible = "arm,armv8-pmuv3",	.data = armv8_pmuv3_init},
	{.compatible = "arm,cortex-a34-pmu",	.data = armv8_a34_pmu_init},
	{.compatible = "arm,cortex-a35-pmu",	.data = armv8_a35_pmu_init},
	{.compatible = "arm,cortex-a53-pmu",	.data = armv8_a53_pmu_init},
	{.compatible = "arm,cortex-a55-pmu",	.data = armv8_a55_pmu_init},
	{.compatible = "arm,cortex-a57-pmu",	.data = armv8_a57_pmu_init},
	{.compatible = "arm,cortex-a65-pmu",	.data = armv8_a65_pmu_init},
	{.compatible = "arm,cortex-a72-pmu",	.data = armv8_a72_pmu_init},
	{.compatible = "arm,cortex-a73-pmu",	.data = armv8_a73_pmu_init},
	{.compatible = "arm,cortex-a75-pmu",	.data = armv8_a75_pmu_init},
	{.compatible = "arm,cortex-a76-pmu",	.data = armv8_a76_pmu_init},
	{.compatible = "arm,cortex-a77-pmu",	.data = armv8_a77_pmu_init},
	{.compatible = "arm,cortex-a78-pmu",	.data = armv8_a78_pmu_init},
	{.compatible = "arm,neoverse-e1-pmu",	.data = armv8_e1_pmu_init},
	{.compatible = "arm,neoverse-n1-pmu",	.data = armv8_n1_pmu_init},
	{.compatible = "cavium,thunder-pmu",	.data = armv8_thunder_pmu_init},
	{.compatible = "brcm,vulcan-pmu",	.data = armv8_vulcan_pmu_init},
	{},
};

static int armv8_pmu_device_probe(struct platform_device *pdev)
{
	return arm_pmu_device_probe(pdev, armv8_pmu_of_device_ids, NULL);
}
```

在 `arm_pmu_device_probe` 中，最终会调用到`perf_pmu_register`
```
int armpmu_register(struct arm_pmu *pmu)
{
	int ret;

	ret = cpu_pmu_init(pmu);
	if (ret)
		return ret;

	if (!pmu->set_event_filter)
		pmu->pmu.capabilities |= PERF_PMU_CAP_NO_EXCLUDE;

	ret = perf_pmu_register(&pmu->pmu, pmu->name, -1);
	if (ret)
		goto out_destroy;

	pr_info("enabled with %s PMU driver, %d counters available%s\n",
		pmu->name, pmu->num_events,
		has_nmi ? ", using NMIs" : "");

	return 0;
}

int arm_pmu_device_probe(struct platform_device *pdev,
			 const struct of_device_id *of_table,
			 const struct pmu_probe_info *probe_table)
{
......

	ret = armpmu_request_irqs(pmu);

	ret = armpmu_register(pmu);

	return 0;
......
}
```


















参考[Linux perf 1.1、perf_event内核框架](https://blog.csdn.net/a515983690/article/details/51504789)
参考[linaroOrg视频](https://www.youtube.com/watch?v=xV4UHWLH_7Y&ab_channel=LinaroOrg)






