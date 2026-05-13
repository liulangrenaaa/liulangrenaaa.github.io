---
title: docker如何使用
date: 2020-12-1 19:00:00
tags:
    - docker
categories:
    - docker
---

这是一个简单概括docker 安装，拉取image,docker 命令使用的 记录。

1. 在ubuntu平台上安装 docker
```
sudo apt install docker
```

2. 拉取ubuntu的 image
```
sudo docker pull ubuntu
```

基于某个tag去拉取 image

```
sudo docker pull arm64v8/ubuntu:jammy
```


3. 基于ubuntu的 image 创建并运行一个docker，限制4MB内存，开启 bash
```
sudo docker run -it -m 4MB ubuntu /bin/bash
```

运行时给予额外 root 权限
```
sudo docker run -it --privileged -m 4MB ubuntu /bin/bash
```

4. 查看当前有哪些运行的docker
```
tencent_clould@ubuntu: ~/workspace# sudo docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
1f3a24f91059        ubuntu              "/bin/bash"         47 hours ago        Up 47 hours                             hhhh
```

5. 查看当前有哪些的docker(运行中 + 非运行中)
```
tencent_clould@ubuntu: ~/workspace# sudo docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
1f3a24f91059        ubuntu              "/bin/bash"         47 hours ago        Up 47 hours                             hhhhh
```

6. 给 hhh 的容器重命名为 my_ubuntu
```
sudo docker rename  hhh my_ubuntu
```

7. 停止 my_ubuntu 容器
```
sudo docker stop my_ubuntu
```

8. 重启开启 my_ubuntu 容器
```
sudo docker start my_ubuntu
```

8. 进入运行中的 my_ubuntu 容器的 bash
```
sudo docker exec -ti my_ubuntu /bin/bash
```

9. 限制 cpu 使用
```
sudo docker run -it --privileged --name my_ubuntu_01  --cpuset-cpus="1,3"  -m 1024M ubuntu:latest /bin/bash
```

其他常用命令想起来再记录

这些命令还是比较长的，可以缩写到 bashrc 的alias里面，比较方便
```
tencent_clould@ubuntu: ~/workspace# cat ~/.zshrc | grep "alias d"
alias dn="sudo docker run -t -i -m 128MB ubuntu /bin/bash"
alias ds="sudo docker start my_ubuntu"
alias dk="sudo docker stop my_ubuntu"
alias di="sudo docker exec -ti my_ubuntu /bin/bash"
alias dps="sudo docker ps"
alias dpsa="sudo docker ps -a"
alias drma="sudo  docker container prune"
```


参考[Docker资源（CPU/内存/磁盘IO/GPU）限制与分配指南](https://blog.51cto.com/liguodong/3918514)


