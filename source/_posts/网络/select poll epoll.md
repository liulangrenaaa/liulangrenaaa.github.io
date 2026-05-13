---
title: select poll epoll
date: 2020-09-12 19:00:00
tags:
    - 网络
    - select
    - poll
    - epoll
categories:
    - 网络
---



## listen()
listen函数的 backlog 参数，限制了 可以 connect到 此 server的最大 socket number。
backlog设置为 125，实际可以 connect到 server的 tcp连接数量是 0-126，一共127个。
