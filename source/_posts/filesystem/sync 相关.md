---
title: sync  相关
date: 2021-02-01 19:00:40
tags:
    - sync
    - filesystem
categories:
    - linux内核
---

## syscalls
linux 关于 sync的系统调用很多，都在`fs/sync.c` 目录下：
+ sync： sync整个系统中所有 `sb`
+ syncfs：sync 单个文件系统单个 `sb`
+ fsync: sync 单个文件，包括 mdata
+ fdatasync: sync单个文件，不包括 mdata
+ sync_file_range：sync文件某段内容，是否脏页，应用程序最清楚
+ sync_file_range2：同 sync_file_range




## 代码分析

### sync

sync整个系统

```
/*
 * Sync everything. We start by waking flusher threads so that most of
 * writeback runs on all devices in parallel. Then we sync all inodes reliably
 * which effectively also waits for all flusher threads to finish doing
 * writeback. At this point all data is on disk so metadata should be stable
 * and we tell filesystems to sync their metadata via ->sync_fs() calls.
 * Finally, we writeout all block devices because some filesystems (e.g. ext2)
 * just write metadata (such as inodes or bitmaps) to block device page cache
 * and do not sync it on their own in ->sync_fs().
 */
void ksys_sync(void)
{
	int nowait = 0, wait = 1;

	wakeup_flusher_threads(WB_REASON_SYNC); // 唤醒 flusher 线程， 所有设备上的 大多数 writeback 可以并行发生
	iterate_supers(sync_inodes_one_sb, NULL); // sync all inodes
	iterate_supers(sync_fs_one_sb, &nowait);  // sync filesystem metdata
	iterate_supers(sync_fs_one_sb, &wait);
	iterate_bdevs(fdatawrite_one_bdev, NULL); // writeout all block devices
	iterate_bdevs(fdatawait_one_bdev, NULL);
	if (unlikely(laptop_mode))
		laptop_sync_completion();
}

SYSCALL_DEFINE0(sync)
{
	ksys_sync();
	return 0;
}
```


### fsync 、 fdatasync

```
/**
 * vfs_fsync - perform a fsync or fdatasync on a file
 * @file:		file to sync
 * @datasync:		only perform a fdatasync operation
 *
 * Write back data and metadata for @file to disk.  If @datasync is
 * set only metadata needed to access modified file data is written.
 */
int vfs_fsync(struct file *file, int datasync)
{
	return vfs_fsync_range(file, 0, LLONG_MAX, datasync);
}

static int do_fsync(unsigned int fd, int datasync)
{
	struct fd f = fdget(fd);
	int ret = -EBADF;

	if (f.file) {
		ret = vfs_fsync(f.file, datasync);
		fdput(f);
	}
	return ret;
}

SYSCALL_DEFINE1(fsync, unsigned int, fd)
{
	return do_fsync(fd, 0);
}

SYSCALL_DEFINE1(fdatasync, unsigned int, fd)
{
	return do_fsync(fd, 1);
}
```

















来trace一下看看
```
tencent_clould@ubuntu: ~/workspace/tmp# sudo bpftrace -e 'tracepoint:vmscan:mm_shrink_slab_start {printf("[pid-%d:%s]: trace_mm_shrink_slab_start start\n", pid,comm)}'
Attaching 1 probe...
[pid-1747572:zsh]: trace_mm_shrink_slab_start start
[pid-1747572:zsh]: trace_mm_shrink_slab_start start

```

```
tencent_clould@ubuntu: ~/workspace/tmp# sudo bpftrace -e 'tracepoint:vmscan:mm_shrink_slab_end {printf("[pid-%d:%s]: trace_mm_shrink_slab_end total_scan = %d\n", pid,comm, args->total_scan)}'
Attaching 1 probe...
[pid-1747572:zsh]: trace_mm_shrink_slab_end total_scan = 0
[pid-1747572:zsh]: trace_mm_shrink_slab_end total_scan = 0
[pid-1747572:zsh]: trace_mm_shrink_slab_end total_scan = 57
[pid-1747572:zsh]: trace_mm_shrink_slab_end total_scan = 0
[pid-1747572:zsh]: trace_mm_shrink_slab_end total_scan = 1
```