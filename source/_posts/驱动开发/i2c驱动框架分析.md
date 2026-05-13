---
title: i2c驱动框架分析
date: 2024-10-13 19:00:00
tags:
    - device drivers
    - i2c
categories:
    - linux内核
---


## i2c 驱动主要结构体
主要是 i2c_adapter i2c_client i2c_msg 这三个结构体.



## i2c_tools
i2c_tools 可以直接通过i2c控制器,访问i2c设备
使用 i2c_tools 需要知道以下几个值
1. i2c 控制器 number
2. i2c 设备地址
3. 读 or 写
4. 读写地址- 



###  i2cdetect
如果不想通过原理图获取当前 设备地址 是什么,可以使用  i2cdetect 来自动检测当前有哪些设备接在当前控制器上,


i2cdetect -y 0
i2cdetect -y 1
i2cdetect -y 2
检测 i2c bus0 上有哪些设备地址存在, 如果存在 则会打印出来, 
如果设备的驱动程序匹配上了,则 打印 UU
如果设备驱动程序没有匹配上,则打印 1f 等类似的设备地址


i2cdetect -l
检测板子上有哪些 i2c bus存在

### i2ctransfer
i2c_tools的 的传输功能工具

i2ctransfer -f -y 0 w2@0x1e 0 0x4 // 写 2byte
12ctransfer -f -y 0 w2@0x1e 0 0x3 
12ctransfer -f -y 0 w1@0x1e 0xc r2 // 写 1byte, 读 2byte
i2ctransfer -f -y 0 w1@0x1e 0xe r2@0x1e

-f : 强制使用, 对于 已经有driver的设备必须使用 -f

### Smbus 协议, 是 i2c协议子协议, 有最低clk限制 10k
i2cget
i2cset