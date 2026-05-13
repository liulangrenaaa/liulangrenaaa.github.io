---
title: page_owner 定位 buddy 内存泄漏
date: 2021-01-16 19:00:00
tags:
    - 内核内存泄漏
    - 内存泄漏
    - page_owner
categories:
    - linux内核
---

## page_owner 原理
主要是通过给 每个分配出去的page 记录调用栈

## page_owner 使用
从mm/makefile 看，需要如下配置
```
if [ $debug_page_owner == 1 ]
then
## page_owner detect and panic start
	echo "CONFIG_STACKDEPOT=y" >> /tmp/.config
	echo "CONFIG_PAGE_EXTENSION=y" >> /tmp/.config
	echo "CONFIG_PAGE_OWNER=y" >> /tmp/.config
## page_owner detect and panic end
fi
```

重新编译之后，启动qemu, 需要加上 `page_owner=on`:
```
sudo qemu-system-x86_64 \
	-kernel /tmp/bzImage \
	-hda /home/ubuntu/myspace/qemu_build/stable_ubuntu.img \
	-append "root=/dev/sda5 console=ttyS0 crashkernel=256M page_owner=on" \
	-smp 4 \
	-m 2048 \
	--enable-kvm \
	-net nic \
	-net user,hostfwd=tcp::2222-:22 \
	--nographic \
	-fsdev local,id=fs1,path=/home/ubuntu/workspace/share,security_model=none \
	-device virtio-9p-pci,fsdev=fs1,mount_tag=host_share
```

查看 `/sys/kernel/debug/page_owner`
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# cat page_owner | wc -l
4363829
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug#
```
记录的信息非常多，然后需要一些工具来帮助检查

```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# cat page_owner > /home/rlk/page_owner.txt
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug# cp /tmp/share/test_modules/resource_leak/page_alloc_leak/page_owner_sort /usr/bin/
stable_kernel@kernel: ~# page_owner_sort ./page_owner.txt sorted_page_owner.txt
loaded 398724
sorting ....
culling
stable_kernel@kernel: ~# cat sorted_page_owner.txt| wc -l
5470295
stable_kernel@kernel: ~# cat page_owner.txt| wc -l
5472954
stable_kernel@kernel: ~#
```

看一下详细信息，`order` `mask`详细信息都有，对于debug 页面内存泄露用处很大。
```
stable_kernel@kernel: ~# cat page_owner.txt | head -n 80
Page allocated via order 2, mask 0xd20c1(GFP_DMA|__GFP_IO|__GFP_FS|__GFP_NOWARN|__GFP_NORETRY|__GFP_COMP|__GFP_NOMEMALLOC), pid 62, ts 121463164s
PFN 1024 type Unmovable Block 2 type Unmovable Flags 0x10200(slab|head)
 prep_new_page+0xcf/0xf0
 get_page_from_freelist+0xd8a/0x1230
 __alloc_pages_nodemask+0x170/0x330
 allocate_slab+0x24f/0x2f0
 ___slab_alloc+0x480/0x6b0
 __slab_alloc+0x50/0x60
 kmem_cache_alloc_trace+0x1fb/0x230
 sr_probe+0x213/0x5e0
 really_probe+0xd6/0x2e0
 driver_probe_device+0x4a/0xa0
 bus_for_each_drv+0x7c/0xc0
 __device_attach+0xe8/0x150
 bus_probe_device+0x9a/0xb0
 device_add+0x39b/0x850
 scsi_sysfs_add_sdev+0x89/0x280
 scsi_probe_and_add_lun+0x81e/0xb90

Page allocated via order 0, mask 0x0(), pid 1, ts 285099088 ns
PFN 4096 type Unmovable Block 8 type Unmovable Flags 0x100000000000000()
 register_early_stack+0x23/0x60
 init_page_owner+0x27/0x290
 kernel_init_freeable+0x158/0x273
 kernel_init+0x5/0x101

Page allocated via order 0, mask 0x0(), pid 1, ts 285099128 ns
PFN 4097 type Unmovable Block 8 type Unmovable Flags 0x100000000000000()
 register_early_stack+0x23/0x60
 init_page_owner+0x27/0x290
 kernel_init_freeable+0x158/0x273
 kernel_init+0x5/0x101
```


## page_owner 代码






## 总结
这个工具 运行 overhead较大，在线上可能不能开启，只能在debug时开启。


参考[内核文档](https://www.kernel.org/doc/html/latest/vm/page_owner.html)
参考[LWN 文章](https://lwn.net/Articles/121656/)