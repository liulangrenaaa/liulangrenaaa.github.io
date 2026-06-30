---
title: ext2文件系统
date: 2021-02-01 19:00:40
tags:
    - filesystem
    - ext2
categories:
    - linux内核
slug: "文件系统/cp-failed"
---



可以直接运行此脚本，会报错
```
#!/bin/bash

touch a

f() {
        let i=0
        while true; do
                let i++
                rm -f b
                strace -o /tmp/cp${BASHPID}.trace cp a b || break
                echo $i
        done
}

cleanup() {
        kill -9 %1 %2
}

f &
f &

trap cleanup exit

wait
```

报错如下：
```
ubuntu@zeku_server:/tmp $ ./cp.sh
1
cp: 无法创建普通文件'b': 文件已存在
2
3
```



参考[cp:无法创建普通文件:文件已存在](https://www.cnblogs.com/zqb-all/p/12942556.html)

