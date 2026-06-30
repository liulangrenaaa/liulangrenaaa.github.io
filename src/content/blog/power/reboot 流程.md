---
title: reboot 流程
date: 2020-09-12 19:00:00
tags:
    - 功耗
    - power management
categories:
    - power management
slug: "power/reboot-流程"
---



# 简介
我们将 `linux power management` 分为两大类， `Generic PM` `Runtime PM`。

Generic PM:
+ halt
+ restart
+ poweroff

对 `Generic PM` 指的是 传统 粗放的、静态的、被动的 linux 内核电源管理机制。

