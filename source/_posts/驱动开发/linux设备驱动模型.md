---
title: linux设备驱动模型
date: 2024-10-11 19:00:00
tags:
    - drivers
    - device
categories:
    - linux内核
---

## 为什么需要设备驱动模型
对于网卡或者某一个外设来说，驱动的方法是固定的（往某个寄存器中写值，接受某个中断等），
但是 不同厂商的SOC设计的时候，外设的基地、中断号址往往都会不一样。

可以理解为设备-device是soc平台，甚至是mach板子的特有属性，这些信息是板子特有的数据，是会变化的。
但是驱动-driver是逻辑，和设备匹配上，拿到基地址、中端号之后，可以按照逻辑去驱动设备。

很早之前(arm32的时候)是没有设备树的，设备都是定义再 arch/arm/mach-xxx/board-xx.c中
`arch/arm/mach-pxa/zeus.c` 就是一个很典型的例子：
```
static struct platform_device zeus_dm9k0_device = {
	.name		= "dm9000",
	.id		= 0,
	.num_resources	= ARRAY_SIZE(zeus_dm9k0_resource),
	.resource	= zeus_dm9k0_resource,
	.dev		= {
		.platform_data = &zeus_dm9k_platdata,
	}
};

static struct platform_device zeus_dm9k1_device = {
	.name		= "dm9000",
	.id		= 1,
	.num_resources	= ARRAY_SIZE(zeus_dm9k1_resource),
	.resource	= zeus_dm9k1_resource,
	.dev		= {
		.platform_data = &zeus_dm9k_platdata,
	}
};

static struct platform_device *zeus_devices[] __initdata = {
	&zeus_dm9k0_device,
	&zeus_dm9k1_device,
};

static void __init zeus_init(void)
{
    ......
	platform_add_devices(zeus_devices, ARRAY_SIZE(zeus_devices));
}
```
设备最后注册到某一个bus_type中，等待驱动加载。
然后在驱动-driver中使用 api 获得 设备-device的信息
```
static int dm9000_probe(struct platform_device *pdev)  
{  
    …  
db->addr_res = platform_get_resource(pdev, IORESOURCE_MEM, 0);  
db->data_res = platform_get_resource(pdev, IORESOURCE_MEM, 1);  
db->irq_res  = platform_get_resource(pdev, IORESOURCE_IRQ, 0);  
…  
}  
```
但是还不够优雅,我们仍然看到大量的arch/arm/mach-yyy/board-a.c这样的代码，充斥着描述板级信息的细节代码，尽管它本身已经和驱动解耦了。
参考[让天堂的归天堂，让尘土的归尘土——谈Linux的总线、设备、驱动模型](https://segmentfault.com/a/1190000020993722)
我们有理由，把这些设备端的信息，用一个非C的脚本语言来描述，这个脚本文件，就是传说中的Device Tree（设备树）。


## 驱动和设备都是什么时候产生的？
### device_driver
静态定义于module 里面， module_init的时候:
```
xxx_driver_register --> driver_register --> bus_add_driver --> drv->bus->p->drivers_autoprobe --> driver_attach --> bus_for_each_dev
```





### device
来自解析于dts中，dtb --> device_node --> device






## 设备树
### 设备树语法

compatible 可以有多个， 会先匹配第一个，然后再匹配后续的

	bluetooth {
		compatible = "brcm,bcm43438-bt", "arm,ble24";
		max-speed = <2000000>;
		shutdown-gpios = <&expgpio 0 GPIO_ACTIVE_HIGH>;
	};



### 设备树编译与反编译
编译就需要编译器，dts编译器是dtc(device tree compiler),有多种途径可以获得
1. `scripts/dtc/` 目录下有dtc工具源码
2. ubuntu 下可以命令行安装 `sudo apt-get install device-tree-compiler`

编译：
```
dtc –I dts –O dtb –o xxx.dtb xxx.dts
```

反编译：
```
dtc –I dtb –O dts –o xxx.dts xxx.dtb
```

还提供了一个fdtdump的工具，可以dump dtb文件,方便查看信息

#### tips
1. boot_command_line
在dts的 chosen节点中的 bootargs 属性中


### 设备树解析



### dts与 sysfs关系
```
cd /sys/firmware/devicetree/base
```










## 如何检查probe函数不跑？
probe函数被调用的条件：
+ driver和device要在同一级总线-bus_type下，比如i2c_bus_type、platform_bus_type等
+ driver和device的compatible属性要相同

假如发现我们驱动的probe函数没有跑，如何排查:
1. /sys/bus 目录下 drivers & devices 目录下的设备和驱动是不是都注册成功
2. 如果drivers & devices 都存在，那肯定是 compatible 属性不对，或者driver的name不对
3. 一般都是 device没注册，有几种情况
+ 确认dts修改是否生效：目录在 /sys/firmware/devicetree/base/
+ 



参考[linux设备驱动：一站式解决probe不跑问题](https://zhuanlan.zhihu.com/p/393839930)

