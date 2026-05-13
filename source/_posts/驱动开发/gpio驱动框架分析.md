---
title: gpio驱动框架分析
date: 2024-10-13 19:00:00
tags:
    - device drivers
    - gpio
categories:
    - linux内核
---



## gpio 驱动解析

gpio-pl061.c:  gpio 控制器厂商的代码
gpiolib.c:    gpio 控制器的代码
gpiolib-of.c:  gpiolib 于 dts 对接部分的代码
