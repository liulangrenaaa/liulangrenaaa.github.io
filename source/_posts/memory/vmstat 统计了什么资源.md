---
title: vmstat 统计了什么资源
date: 2021-02-01 19:00:40
tags:
    - vmstat
categories:
    - linux内核
---

`mm/vmstat.c` 提供了很多对内存方面的统计，在`/proc/vmstat` 上有体现。

## vmstat 在不同维度上的统计
先看 `drain_zonestat` 函数
```
void drain_zonestat(struct zone *zone, struct per_cpu_pageset *pset)
{
	int i;

	for (i = 0; i < NR_VM_ZONE_STAT_ITEMS; i++)
		if (pset->vm_stat_diff[i]) {
			int v = pset->vm_stat_diff[i];
			pset->vm_stat_diff[i] = 0;
			atomic_long_add(v, &zone->vm_stat[i]);
			atomic_long_add(v, &vm_zone_stat[i]);
		}

#ifdef CONFIG_NUMA
	for (i = 0; i < NR_VM_NUMA_STAT_ITEMS; i++)
		if (pset->vm_numa_stat_diff[i]) {
			int v = pset->vm_numa_stat_diff[i];

			pset->vm_numa_stat_diff[i] = 0;
			atomic_long_add(v, &zone->vm_numa_stat[i]);
			atomic_long_add(v, &vm_numa_stat[i]);
		}
#endif
}
```
可以发现 `struct per_cpu_pageset->vm_stat_diff[NR_VM_ZONE_STAT_ITEMS]` `zone->vm_stat[NR_VM_ZONE_STAT_ITEMS]` `vm_zone_stat[NR_VM_ZONE_STAT_ITEMS]` 是不同维度上，对同一类信息的统计 -- vm 虚拟内存的使用情况的监控


```
enum zone_stat_item {
	/* First 128 byte cacheline (assuming 64 bit words) */
	NR_FREE_PAGES,
	NR_ZONE_LRU_BASE, /* Used only for compaction and reclaim retry */
	NR_ZONE_INACTIVE_ANON = NR_ZONE_LRU_BASE,
	NR_ZONE_ACTIVE_ANON,
	NR_ZONE_INACTIVE_FILE,
	NR_ZONE_ACTIVE_FILE,
	NR_ZONE_UNEVICTABLE,
	NR_ZONE_WRITE_PENDING,	/* Count of dirty, writeback and unstable pages */
	NR_MLOCK,		/* mlock()ed pages found and moved off LRU */
	/* Second 128 byte cacheline */
	NR_BOUNCE,
#if IS_ENABLED(CONFIG_ZSMALLOC)
	NR_ZSPAGES,		/* allocated in zsmalloc */
#endif
	NR_FREE_CMA_PAGES,
	NR_VM_ZONE_STAT_ITEMS };
```

对应实际系统中`/proc/vmstat`的文件
```
Inspiron-5548@ubuntu: ~/workspace# cat /proc/vmstat | grep zone
nr_zone_inactive_anon 6569
nr_zone_active_anon 317170
nr_zone_inactive_file 211371
nr_zone_active_file 138953
nr_zone_unevictable 84539
nr_zone_write_pending 35
zone_reclaim_failed 0
Inspiron-5548@ubuntu: ~/workspace#
```

`struct per_cpu_pageset->vm_numa_stat_diff[NR_VM_NUMA_STAT_ITEMS]` `zone->vm_numa_stat[NR_VM_NUMA_STAT_ITEMS]` `vm_numa_stat[NR_VM_NUMA_STAT_ITEMS]` 也是不同维度上，对同一类信息的统计 -- numa 内存分配行为的监控

```
enum numa_stat_item {
	NUMA_HIT,		/* allocated in intended node */
	NUMA_MISS,		/* allocated in non intended node */
	NUMA_FOREIGN,		/* was intended here, hit elsewhere */
	NUMA_INTERLEAVE_HIT,	/* interleaver preferred this zone */
	NUMA_LOCAL,		/* allocation from local node */
	NUMA_OTHER,		/* allocation from other node */
	NR_VM_NUMA_STAT_ITEMS
};
```

对应实际系统中`/proc/vmstat`的文件
```
Inspiron-5548@ubuntu: ~/workspace# cat /proc/vmstat | grep numa
numa_hit 2605582
numa_miss 0
numa_foreign 0
numa_interleave 45536
numa_local 2605582
numa_other 0
numa_pte_updates 0
numa_huge_pte_updates 0
numa_hint_faults 0
numa_hint_faults_local 0
numa_pages_migrated 0
Inspiron-5548@ubuntu: ~/workspace#
```


上面`/proc/vmstat` 是整个系统的情况，对应 `vm_zone_stat` 与 `vm_numa_stat`。

`/proc/zoneinfo`是 对应的是`zone` 和 `pcp`的情况，对应的是 `zone->vm_stat` 与 `zone->vm_numa_stat`， 和 `per_cpu_pageset->vm_stat_diff` 与 `per_cpu_pageset->vm_numa_stat_diff`

```
Inspiron-5548@ubuntu: ~/workspace# cat /proc/zoneinfo
Node 0, zone   Normal
  pages free     9557
        min      6807
        low      8508
        high     10209
        spanned  389120
        present  389120
        managed  370822
        protection: (0, 0, 0, 0, 0)
      nr_free_pages 9557
      nr_zone_inactive_anon 224
      nr_zone_active_anon 114422
      nr_zone_inactive_file 120358
      nr_zone_active_file 58547
      nr_zone_unevictable 7191
      nr_zone_write_pending 3
      nr_mlock     4
      nr_page_table_pages 2879
      nr_kernel_stack 8016
      nr_bounce    0
      nr_zspages   0
      nr_free_cma  0
      numa_hit     870583
      numa_miss    0
      numa_foreign 0
      numa_interleave 45534
      numa_local   870583
      numa_other   0
  pagesets
    cpu: 0
              count: 293
              high:  378
              batch: 63
  vm stats threshold: 30
    cpu: 1
              count: 293
              high:  378
              batch: 63
  vm stats threshold: 30
    cpu: 2
              count: 234
              high:  378
              batch: 63
  vm stats threshold: 30
    cpu: 3
              count: 338
              high:  378
              batch: 63
  vm stats threshold: 30
  node_unreclaimable:  0
  start_pfn:           1048576
```






## 全局统计的数据
可能和上面有些许冲突
```
atomic_long_t vm_zone_stat[NR_VM_ZONE_STAT_ITEMS] __cacheline_aligned_in_smp;
atomic_long_t vm_numa_stat[NR_VM_NUMA_STAT_ITEMS] __cacheline_aligned_in_smp;
atomic_long_t vm_node_stat[NR_VM_NODE_STAT_ITEMS] __cacheline_aligned_in_smp;
```

分别是 `zone` `numa` `node` 的统计信息，`zone` `numa` 上面都已经分析了
这个 `node` 对应着 `/proc/zoneinfo` 开头信息
```
Inspiron-5548@ubuntu: ~/workspace# cat /proc/zoneinfo
Node 0, zone      DMA
  per-node stats
      nr_inactive_anon 6591
      nr_active_anon 315599
      nr_inactive_file 212218
      nr_active_file 139142
      nr_unevictable 84780
      nr_slab_reclaimable 23493
      nr_slab_unreclaimable 26794
      nr_isolated_anon 0
      nr_isolated_file 0
      workingset_nodes 0
      workingset_refault 0
      workingset_activate 0
      workingset_restore 0
      workingset_nodereclaim 0
      nr_anon_pages 332534
      nr_mapped    104733
      nr_file_pages 425795
      nr_dirty     7
      nr_writeback 0
      nr_writeback_temp 0
      nr_shmem     95530
      nr_shmem_hugepages 0
      nr_shmem_pmdmapped 0
      nr_file_hugepages 0
      nr_file_pmdmapped 0
      nr_anon_transparent_hugepages 0
      nr_vmscan_write 0
      nr_vmscan_immediate_reclaim 0
      nr_dirtied   81310
      nr_written   72963
      nr_kernel_misc_reclaimable 0
      nr_foll_pin_acquired 0
      nr_foll_pin_released 0
  pages free     3788
```

与定义 也十分相符
```

enum node_stat_item {
	NR_LRU_BASE,
	NR_INACTIVE_ANON = NR_LRU_BASE, /* must match order of LRU_[IN]ACTIVE */
	NR_ACTIVE_ANON,		/*  "     "     "   "       "         */
	NR_INACTIVE_FILE,	/*  "     "     "   "       "         */
	NR_ACTIVE_FILE,		/*  "     "     "   "       "         */
	NR_UNEVICTABLE,		/*  "     "     "   "       "         */
	NR_SLAB_RECLAIMABLE_B,
	NR_SLAB_UNRECLAIMABLE_B,
	NR_ISOLATED_ANON,	/* Temporary isolated pages from anon lru */
	NR_ISOLATED_FILE,	/* Temporary isolated pages from file lru */
	WORKINGSET_NODES,
	WORKINGSET_REFAULT_BASE,
	WORKINGSET_REFAULT_ANON = WORKINGSET_REFAULT_BASE,
	WORKINGSET_REFAULT_FILE,
	WORKINGSET_ACTIVATE_BASE,
	WORKINGSET_ACTIVATE_ANON = WORKINGSET_ACTIVATE_BASE,
	WORKINGSET_ACTIVATE_FILE,
	WORKINGSET_RESTORE_BASE,
	WORKINGSET_RESTORE_ANON = WORKINGSET_RESTORE_BASE,
	WORKINGSET_RESTORE_FILE,
	WORKINGSET_NODERECLAIM,
	NR_ANON_MAPPED,	/* Mapped anonymous pages */
	NR_FILE_MAPPED,	/* pagecache pages mapped into pagetables.
			   only modified from process context */
	NR_FILE_PAGES,
	NR_FILE_DIRTY,
	NR_WRITEBACK,
	NR_WRITEBACK_TEMP,	/* Writeback using temporary buffers */
	NR_SHMEM,		/* shmem pages (included tmpfs/GEM pages) */
	NR_SHMEM_THPS,
	NR_SHMEM_PMDMAPPED,
	NR_FILE_THPS,
	NR_FILE_PMDMAPPED,
	NR_ANON_THPS,
	NR_VMSCAN_WRITE,
	NR_VMSCAN_IMMEDIATE,	/* Prioritise for reclaim when writeback ends */
	NR_DIRTIED,		/* page dirtyings since bootup */
	NR_WRITTEN,		/* page writings since bootup */
	NR_KERNEL_MISC_RECLAIMABLE,	/* reclaimable non-slab kernel pages */
	NR_FOLL_PIN_ACQUIRED,	/* via: pin_user_page(), gup flag: FOLL_PIN */
	NR_FOLL_PIN_RELEASED,	/* pages returned via unpin_user_page() */
	NR_KERNEL_STACK_KB,	/* measured in KiB */
#if IS_ENABLED(CONFIG_SHADOW_CALL_STACK)
	NR_KERNEL_SCS_KB,	/* measured in KiB */
#endif
	NR_PAGETABLE,		/* used for pagetables */
	NR_VM_NODE_STAT_ITEMS
};
```

atomic_long_t vm_zone_stat[NR_VM_ZONE_STAT_ITEMS] __cacheline_aligned_in_smp;
atomic_long_t vm_numa_stat[NR_VM_NUMA_STAT_ITEMS] __cacheline_aligned_in_smp;
atomic_long_t vm_node_stat[NR_VM_NODE_STAT_ITEMS] __cacheline_aligned_in_smp;

`vm_zone_stat` 主要是 统计各个zone的各种 anon file active inactive page的数量。
`vm_numa_stat` 主要是 统计各个 node 节点上内存分配行为，是从本节点分配的，还是跨节点分配了内存。
`vm_node_stat` 主要是 统计各个 node节点 的各种 anon file active inactive page的数量，还有各种类型 shmem dirty writeback的page数量




## migrate type 是来定义什么的？

```
enum migratetype {
	MIGRATE_UNMOVABLE,
	MIGRATE_MOVABLE,
	MIGRATE_RECLAIMABLE,
	MIGRATE_PCPTYPES,	/* the number of types on the pcp lists */
	MIGRATE_HIGHATOMIC = MIGRATE_PCPTYPES,
	MIGRATE_TYPES
};
```

很明显 `migratetype` 是用来定义 伙伴系统中页面的，`order相同`情况下根据是否可以 `移动`，分成了几条 list，方便了后面各种 内存迁移，内存规整。

```
struct free_area {
	struct list_head	free_list[MIGRATE_TYPES];
	unsigned long		nr_free;
};
```

```
struct zone {
    struct free_area	free_area[MAX_ORDER];
}
```


## lruvec 是在哪个维度上？

2016年之前 `lru` 是基于`zone`这个维度上的，现在都是基于 `node`这个维度的
```
commit 75ef7184053989118d3814c558a9af62e7376a58
Author: Mel Gorman <mgorman@techsingularity.net>
Date:   Thu Jul 28 15:45:24 2016 -0700

    mm, vmstat: add infrastructure for per-node vmstats

    Patchset: "Move LRU page reclaim from zones to nodes v9"
```

先看定义
```
enum lru_list {
	LRU_INACTIVE_ANON = LRU_BASE,
	LRU_ACTIVE_ANON = LRU_BASE + LRU_ACTIVE,
	LRU_INACTIVE_FILE = LRU_BASE + LRU_FILE,
	LRU_ACTIVE_FILE = LRU_BASE + LRU_FILE + LRU_ACTIVE,
	LRU_UNEVICTABLE,
	NR_LRU_LISTS
};

struct lruvec {
	struct list_head		lists[NR_LRU_LISTS];
	/* per lruvec lru_lock for memcg */
	spinlock_t			lru_lock;
#ifdef CONFIG_MEMCG
	struct pglist_data *pgdat;
#endif
};

typedef struct pglist_data {
	struct lruvec		__lruvec;
} pg_data_t;
```

















代码定义大多来自于`Linux 5.10`