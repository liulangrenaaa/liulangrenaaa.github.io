---
title: drop_caches  相关
date: 2021-02-01 19:00:40
tags:
    - drop_caches
    - cache
categories:
    - linux内核
slug: "filesystem/drop_caches-相关"
---


## proc文件系统
`drop_caches` 文件位于系统 `/proc/sys/vm`
```
Inspiron-5548@ubuntu: /proc/sys/vm# ls -al | grep drop
--w------- 1 root root 0 2月   7 14:14 drop_caches
Inspiron-5548@ubuntu: /proc/sys/vm#
```

可以写入`1`:drop page cache `2`: drop slab `3`: drop page cache and slab 等值







## 代码分析
相关代码主要在 `fs/drop_caches.c` 目录下

```
int drop_caches_sysctl_handler(struct ctl_table *table, int write,
		void *buffer, size_t *length, loff_t *ppos)
{
    ......
		if (sysctl_drop_caches & 1) {
			iterate_supers(drop_pagecache_sb, NULL);
			count_vm_event(DROP_PAGECACHE);
		}
		if (sysctl_drop_caches & 2) {
			drop_slab();
			count_vm_event(DROP_SLAB);
		}
    ......
}
```

可以看到：
如果写入的值 `bit1` 是1，就会回收`page cache`，如果写入的值 `bit2` 是1，就会回收`slab`。


### pagecache 回收

简化一些定义 lock操作，如下：
```
static void drop_pagecache_sb(struct super_block *sb, void *unused)
{
    ......
	list_for_each_entry(inode, &sb->s_inodes, i_sb_list) {
		__iget(inode);
		invalidate_mapping_pages(inode->i_mapping, 0, -1);
		cond_resched();
	}
	iput(toput_inode);
    ......
}

void iterate_supers(void (*f)(struct super_block *, void *), void *arg)
{
    ......
	list_for_each_entry(sb, &super_blocks, s_list) {
		sb->s_count++;
		down_read(&sb->s_umount);
		if (sb->s_root && (sb->s_flags & SB_BORN))
			f(sb, arg);
		up_read(&sb->s_umount);
	}
    ......
}
```

首先遍历`super_blocks`，然后 遍历`sb->s_inodes`，实际的回收 `pagecache`是针对于 `inode->i_mappings`的，对应代码就是 `invalidate_mapping_pages(inode->i_mapping, 0, -1);`。

```
int remove_mapping(struct address_space *mapping, struct page *page)
{
	if (__remove_mapping(mapping, page, false, NULL)) {
		/*
		 * Unfreezing the refcount with 1 rather than 2 effectively
		 * drops the pagecache ref for us without requiring another
		 * atomic operation.
		 */
		page_ref_unfreeze(page, 1);
		return 1;
	}
	return 0;
}

static int
invalidate_complete_page(struct address_space *mapping, struct page *page)
{
	int ret;

	if (page->mapping != mapping)
		return 0;

	if (page_has_private(page) && !try_to_release_page(page, 0))
		return 0;

	ret = remove_mapping(mapping, page);

	return ret;
}

int invalidate_inode_page(struct page *page)
{
	struct address_space *mapping = page_mapping(page);
	if (!mapping)
		return 0;
	if (PageDirty(page) || PageWriteback(page))
		return 0;
	if (page_mapped(page))
		return 0;
	return invalidate_complete_page(mapping, page);
}

static unsigned long __invalidate_mapping_pages(struct address_space *mapping,
		pgoff_t start, pgoff_t end, unsigned long *nr_pagevec)
{
	while (index <= end && pagevec_lookup_entries(&pvec, mapping, index,
			min(end - index, (pgoff_t)PAGEVEC_SIZE - 1) + 1,
			indices)) {
		for (i = 0; i < pagevec_count(&pvec); i++) {
			struct page *page = pvec.pages[i];

			/* We rely upon deletion not changing page->index */
			index = indices[i];
			ret = invalidate_inode_page(page);
			unlock_page(page);
			/*
			 * Invalidation is a hint that the page is no longer
			 * of interest and try to speed up its reclaim.
			 */
			if (!ret) {
				deactivate_file_page(page);
				/* It is likely on the pagevec of a remote CPU */
				if (nr_pagevec)
					(*nr_pagevec)++;
			}
			count += ret;
		}
		pagevec_remove_exceptionals(&pvec);
		pagevec_release(&pvec);

		index++;
	}
	return count;
}

/**
 * invalidate_mapping_pages - Invalidate all the unlocked pages of one inode
 * @mapping: the address_space which holds the pages to invalidate
 * @start: the offset 'from' which to invalidate
 * @end: the offset 'to' which to invalidate (inclusive)
 *
 * This function only removes the unlocked pages, if you want to
 * remove all the pages of one inode, you must call truncate_inode_pages.
 *
 * invalidate_mapping_pages() will not block on IO activity. It will not
 * invalidate pages which are dirty, locked, under writeback or mapped into
 * pagetables.
 *
 * Return: the number of the pages that were invalidated
 */
unsigned long invalidate_mapping_pages(struct address_space *mapping,
		pgoff_t start, pgoff_t end)
{
	return __invalidate_mapping_pages(mapping, start, end, NULL);
}
EXPORT_SYMBOL(invalidate_mapping_pages);
```

`invalidate_mapping_pages` 会尝试 将这个`inode`对应的`pagecache`invaild掉（就像注释里面写的，除去`dirty` `locked` `writeback`的 page）。

所以 `drop cache` 不会将脏页给drop掉，要想 drop掉脏页，需要先`sync()`一下。



### slab 回收

```
static unsigned long shrink_slab(gfp_t gfp_mask, int nid,
				 struct mem_cgroup *memcg,
				 int priority)
{
	unsigned long ret, freed = 0;
	struct shrinker *shrinker;

	if (!down_read_trylock(&shrinker_rwsem))
		goto out;

	list_for_each_entry(shrinker, &shrinker_list, list) {
		struct shrink_control sc = {
			.gfp_mask = gfp_mask,
			.nid = nid,
			.memcg = memcg,
		};

		ret = do_shrink_slab(&sc, shrinker, priority);
		if (ret == SHRINK_EMPTY)
			ret = 0;
		freed += ret;
		/*
		 * Bail out if someone want to register a new shrinker to
		 * prevent the registration from being stalled for long periods
		 * by parallel ongoing shrinking.
		 */
		if (rwsem_is_contended(&shrinker_rwsem)) {
			freed = freed ? : 1;
			break;
		}
	}

	up_read(&shrinker_rwsem);
out:
	cond_resched();
	return freed;
}

void drop_slab_node(int nid)
{
	unsigned long freed;

	do {
		struct mem_cgroup *memcg = NULL;
		freed = 0;
		memcg = mem_cgroup_iter(NULL, NULL, NULL);
		do {
			freed += shrink_slab(GFP_KERNEL, nid, memcg, 0);
		} while ((memcg = mem_cgroup_iter(NULL, memcg, NULL)) != NULL);
	} while (freed > 10);
}

void drop_slab(void)
{
	int nid;

	for_each_online_node(nid)
		drop_slab_node(nid);
}
```


`drop_slab` 过程首先会遍历 `online_node`，对该 `node`进行 `drop_slab_node`。

在`drop_slab_node` 中，会遍历 `memcg`进行`shrink_slab`，退出条件是，这一次回收的 `slab objects` 小于10.

在 `shrink_slab` 中，会遍历注册的 `shrinker`，使用`do_shrink_slab` 对每个`shrinker` 进行slab内存回收。

```
static unsigned long do_shrink_slab(struct shrink_control *shrinkctl,
				    struct shrinker *shrinker, int priority)
{
	trace_mm_shrink_slab_start(shrinker, shrinkctl, nr,
				   freeable, delta, total_scan, priority);

	while (total_scan >= batch_size ||
	       total_scan >= freeable) {
		unsigned long ret;
		unsigned long nr_to_scan = min(batch_size, total_scan);

		shrinkctl->nr_to_scan = nr_to_scan;
		shrinkctl->nr_scanned = nr_to_scan;
		ret = shrinker->scan_objects(shrinker, shrinkctl);
		if (ret == SHRINK_STOP)
			break;
		freed += ret;

		count_vm_events(SLABS_SCANNED, shrinkctl->nr_scanned);
		total_scan -= shrinkctl->nr_scanned;
		scanned += shrinkctl->nr_scanned;

		cond_resched();
	}

	trace_mm_shrink_slab_end(shrinker, nid, freed, nr, new_nr, total_scan);
	return freed;
}
```

在 `do_shrink_slab` 中，有两个 `tracepoint`点，分别是 start end，可以用来追踪相关事件，
实际回收的函数是 `shrinker->scan_objects(shrinker, shrinkctl);`

不同的`slab`，会注册不同的 `shrinker`.
example:
```
int ext4_es_register_shrinker(struct ext4_sb_info *sbi)
{
	sbi->s_es_shrinker.scan_objects = ext4_es_scan;
	sbi->s_es_shrinker.count_objects = ext4_es_count;
	sbi->s_es_shrinker.seeks = DEFAULT_SEEKS;
	err = register_shrinker(&sbi->s_es_shrinker);
}

static int __init hugepage_init(void)
{
	err = register_shrinker(&huge_zero_page_shrinker);
	if (err)
		goto err_hzp_shrinker;
	err = register_shrinker(&deferred_split_shrinker);
	if (err)
		goto err_split_shrinker;
}
```

实际上 `shrink_slab` 不仅仅在 `drop_slab_node` 中使用，在 内存回收的时候，也会通过`shrink_node_memcgs` 调用到
```
static void shrink_node_memcgs(pg_data_t *pgdat, struct scan_control *sc)
{
    ......
		shrink_lruvec(lruvec, sc);
		shrink_slab(sc->gfp_mask, pgdat->node_id, memcg,
			    sc->priority);
    ......
}

static void shrink_node(pg_data_t *pgdat, struct scan_control *sc)
{
    shrink_node_memcgs(pgdat, sc);
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





代码定义大多来自于`Linux 5.10`