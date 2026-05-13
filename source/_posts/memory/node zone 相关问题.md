---
title: node zone 相关问题
date: 2021-02-04 19:00:40
tags:
    - node
    - zone
categories:
    - linux内核
---


## NUMA概念
在NUMA出现之前，CPU朝着高频率的方向发展遇到了天花板，转而向着多核心的方向发展。

在一开始，内存控制器还在北桥中，所有CPU对内存的访问都要通过北桥来完成。此时所有CPU访问内存都是“一致的”，如下图所示：

NUMA 全称 Non-Uniform Memory Access，译为“非一致性内存访问”。这种构架下，不同的内存器件和CPU核心从属不同的 Node，每个 Node 都有自己的集成内存控制器（IMC，Integrated Memory Controller）。

在 Node 内部，架构类似SMP，使用 IMC Bus 进行不同核心间的通信；不同的 Node 间通过QPI（Quick Path Interconnect）进行通信，如下图所示：
一般来说，一个内存插槽对应一个 Node。需要注意的一个特点是，QPI的延迟要高于IMC Bus，也就是说CPU访问内存有了远近（remote/local）之别，而且实验分析来看，这个差别非常明显。

NUMA概念 是想对于`CPU`来说的，系统中主存不同`node`对于不同CPU来说访问速度不一样，就应该可以理解成为NUMA。

## node
`node` 就是 一个节点，不同节点对于一个CPU来讲访问延迟 是不一样的。
在linux上用 `pg_data_t` 来表示，同时 `pg_data_t` 也包含了`struct lruvec` lru链表。
同时 `kswapd`  `kcompactd` 线程也都是基于 `pg_data_t`的。






## zone
`zone` 是基于 `node`的，一般分为如下
```
Inspiron-5548@ubuntu: ~/workspace/linux-stable# cat /proc/zoneinfo | grep "Node 0"
Node 0, zone      DMA
Node 0, zone    DMA32
Node 0, zone   Normal
Node 0, zone  Movable
Node 0, zone   Device
```
其中 `_watermark` `struct per_cpu_pageset`  `struct free_area` 都是基于 `zone`的。

虽然 `kcompactd`是基于node的，但是 `compaction` 行为是基于zone的。

```
struct zone {
	/* zone watermarks, access with *_wmark_pages(zone) macros */
	unsigned long _watermark[NR_WMARK];
	unsigned long watermark_boost;
	......
}

struct zoneref {
	struct zone *zone;	/* Pointer to actual zone */
	int zone_idx;		/* zone_idx(zoneref->zone) */
};

struct zonelist {
	struct zoneref _zonerefs[MAX_ZONES_PER_ZONELIST + 1];
};

typedef struct pglist_data {
	/*
	 * node_zones contains just the zones for THIS node. Not all of the
	 * zones may be populated, but it is the full list. It is referenced by
	 * this node's node_zonelists as well as other node's node_zonelists.
	 */
	struct zone node_zones[MAX_NR_ZONES];

	/*
	 * node_zonelists contains references to all zones in all nodes.
	 * Generally the first zones will be references to this node's
	 * node_zones.
	 */
	struct zonelist node_zonelists[MAX_ZONELISTS];
}
```


## node是如何建立起来的？
`arch/x86/mm/numa.c`中定义了 指针数组，可以系统`bring up`的时候初始化，也可以是 `memory_hotplug`时候初始化。
```
struct pglist_data *node_data[MAX_NUMNODES] __read_mostly;
```

如何查找 不同的`node`节点？
根据`nid`查找
```
#define NODE_DATA(nid)		(node_data[nid])
```

根据`zone`查找`node`节点
```
struct zone {
	......
#ifdef CONFIG_NUMA
	int node;
#endif
	......
}
```

根据`page`查找`node`节点，在 `include/linux/mm.h`
```
#define NODES_WIDTH		NODES_SHIFT
#define NODES_MASK		((1UL << NODES_WIDTH) - 1)

static inline void set_page_node(struct page *page, unsigned long node) {
	page->flags &= ~(NODES_MASK << NODES_PGSHIFT);
	page->flags |= (node & NODES_MASK) << NODES_PGSHIFT;
}

static inline int page_to_nid(const struct page *page) {
	struct page *p = (struct page *)page;

	return (PF_POISONED_CHECK(p)->flags >> NODES_PGSHIFT) & NODES_MASK;
}
```



## zone是如何建立起来的？

`start_kernel`中
```
asmlinkage __visible void __init __no_sanitize_address start_kernel(void)
{
	build_all_zonelists(NULL);
	......
}
```


在 `mm/memory_hotplug.c` 的 `hotadd_new_pgdat`函数中
```
/* we are OK calling __meminit stuff here - we have CONFIG_MEMORY_HOTPLUG */
static pg_data_t __ref *hotadd_new_pgdat(int nid)
{
	build_all_zonelists(pgdat);
	......
}
```

在 `build_all_zonelists` 中 根据是否处于 `SYSTEM_BOOTING` 进行初始化，最终到`__build_all_zonelists`，如果是 `memory hot plug` 只需要进行当前`self` pgdata的初始化，如果是 `SYSTEM_BOOTING` 需要遍历所有在线的 node节点，都需要初始化。

```
static void build_zonelists(pg_data_t *pgdat)
{
	......
	while ((node = find_next_best_node(local_node, &used_mask)) >= 0) {
		if (node_distance(local_node, node) !=
		    node_distance(local_node, prev_node))
			node_load[node] = load;

		node_order[nr_nodes++] = node;
		prev_node = node;
		load--;
	}

	build_zonelists_in_node_order(pgdat, node_order, nr_nodes);
	build_thisnode_zonelists(pgdat);
}

static void __build_all_zonelists(void *data)
{
	/*
	 * This node is hotadded and no memory is yet present.   So just
	 * building zonelists is fine - no need to touch other nodes.
	 */
	if (self && !node_online(self->node_id)) { // hotplug
		build_zonelists(self);
	} else {
		for_each_online_node(nid) { //system init
			build_zonelists(NODE_DATA(nid));
		}
	}
	.......
}

void __ref build_all_zonelists(pg_data_t *pgdat)
{
	if (system_state == SYSTEM_BOOTING) {
		build_all_zonelists_init();
	} else {
		__build_all_zonelists(pgdat);
	}
}
```


这里又涉及到 `pgdat->node_zonelists[ZONELIST_FALLBACK]` 这个 `fallback` 机制的问题了。
```
enum {
	ZONELIST_FALLBACK,	/* zonelist with fallback */
#ifdef CONFIG_NUMA
	/*
	 * The NUMA zonelists are doubled because we need zonelists that
	 * restrict the allocations to a single node for __GFP_THISNODE.
	 */
	ZONELIST_NOFALLBACK,	/* zonelist without fallback (__GFP_THISNODE) */
#endif
	MAX_ZONELISTS
};
```

pgdat->node_zonelists[]包含了2个zonelist，一个是由本node的zones组成，另一个是由从本node分配不到内存时可选的备用zones组成，相当于是选择了一个退路，所以叫fallback。

具体初始化是由 `build_zonelists_in_node_order` 与 `build_thisnode_zonelists`完成的
```
static void zoneref_set_zone(struct zone *zone, struct zoneref *zoneref)
{
	zoneref->zone = zone;
	zoneref->zone_idx = zone_idx(zone);
}

//可以看到赋值顺序是：
// zonerefs[nr_zones++]
// zone_type--;
static int build_zonerefs_node(pg_data_t *pgdat, struct zoneref *zonerefs)
{
	struct zone *zone;
	enum zone_type zone_type = MAX_NR_ZONES;
	int nr_zones = 0;

	do {
		zone_type--;
		zone = pgdat->node_zones + zone_type;
		if (managed_zone(zone)) {
			zoneref_set_zone(zone, &zonerefs[nr_zones++]);
			check_highest_zone(zone_type);
		}
	} while (zone_type);

	return nr_zones;
}

/*
 * Build zonelists ordered by node and zones within node.
 * This results in maximum locality--normal zone overflows into local
 * DMA zone, if any--but risks exhausting DMA zone.
 */
static void build_zonelists_in_node_order(pg_data_t *pgdat, int *node_order,
		unsigned nr_nodes)
{
	struct zoneref *zonerefs;
	int i;

	zonerefs = pgdat->node_zonelists[ZONELIST_FALLBACK]._zonerefs;

	for (i = 0; i < nr_nodes; i++) {
		int nr_zones;

		pg_data_t *node = NODE_DATA(node_order[i]);

		nr_zones = build_zonerefs_node(node, zonerefs);
		zonerefs += nr_zones;
	}
	zonerefs->zone = NULL;
	zonerefs->zone_idx = 0;
}

/*
 * Build gfp_thisnode zonelists
 */
static void build_thisnode_zonelists(pg_data_t *pgdat)
{
	struct zoneref *zonerefs;
	int nr_zones;

	zonerefs = pgdat->node_zonelists[ZONELIST_NOFALLBACK]._zonerefs;
	nr_zones = build_zonerefs_node(pgdat, zonerefs);
	zonerefs += nr_zones;
	zonerefs->zone = NULL;
	zonerefs->zone_idx = 0;
}
```



如何查找 不同的`zone`区？

根据`page`查找`zone`区，在 `include/linux/mm.h`
```
#define ZONES_WIDTH		ZONES_SHIFT
#define ZONES_MASK		((1UL << ZONES_WIDTH) - 1)

static inline void set_page_zone(struct page *page, enum zone_type zone) {
	page->flags &= ~(ZONES_MASK << ZONES_PGSHIFT);
	page->flags |= (zone & ZONES_MASK) << ZONES_PGSHIFT;
}

static inline int page_zone_id(struct page *page) {
	return (page->flags >> ZONEID_PGSHIFT) & ZONEID_MASK;
}
```



## zone相关参数 在 alloc_pages 中如何起作用的

`alloc_pages` 最后调用到 `__alloc_pages_nodemask` 根据 `gfp` 和 mempolicy等生成了两个参数 `preferred_nid`  `nodemask`，需要探究一下这两个参数生成背后逻辑
```
struct page *
__alloc_pages_nodemask(gfp_t gfp_mask, unsigned int order, int preferred_nid,
							nodemask_t *nodemask);
struct page *alloc_pages_current(gfp_t gfp, unsigned order)
{
	struct mempolicy *pol = &default_policy;
	struct page *page;

	if (!in_interrupt() && !(gfp & __GFP_THISNODE))
		pol = get_task_policy(current);

	/*
	 * No reference counting needed for current->mempolicy
	 * nor system default_policy
	 */
	if (pol->mode == MPOL_INTERLEAVE)
		page = alloc_page_interleave(gfp, order, interleave_nodes(pol));
	else
		page = __alloc_pages_nodemask(gfp, order,
				policy_node(gfp, pol, numa_node_id()),
				policy_nodemask(gfp, pol));

	return page;
}


static inline struct page *
alloc_pages(gfp_t gfp_mask, unsigned int order)
{
	return alloc_pages_current(gfp_mask, order);
}
```


`policy_node` 代码：
```
DECLARE_PER_CPU(int, numa_node);

static inline int numa_node_id(void)
{
	return raw_cpu_read(numa_node);
}

static inline void set_numa_node(int node)
{
	this_cpu_write(numa_node, node);
}

/* Return the node id preferred by the given mempolicy, or the given id */
static int policy_node(gfp_t gfp, struct mempolicy *policy, int nd)
{
	if (policy->mode == MPOL_PREFERRED && !(policy->flags & MPOL_F_LOCAL))
		nd = policy->v.preferred_node;
	else {
		/*
		 * __GFP_THISNODE shouldn't even be used with the bind policy
		 * because we might easily break the expectation to stay on the
		 * requested node and not break the policy.
		 */
		WARN_ON_ONCE(policy->mode == MPOL_BIND && (gfp & __GFP_THISNODE));
	}

	return nd;
}
```


`policy_nodemask` 代码：
```
/*
 * Return a nodemask representing a mempolicy for filtering nodes for
 * page allocation
 */
nodemask_t *policy_nodemask(gfp_t gfp, struct mempolicy *policy)
{
	/* Lower zones don't get a nodemask applied for MPOL_BIND */
	if (unlikely(policy->mode == MPOL_BIND) &&
			apply_policy_zone(policy, gfp_zone(gfp)) &&
			cpuset_nodemask_valid_mems_allowed(&policy->v.nodes))
		return &policy->v.nodes;

	return NULL;
}
```

跟踪发现  `policy_nodemask` 返回值基本都是 `NULL`，除非特殊需求，使用过`mbind`才会返回非`NULL`。
```
Inspiron-5548@ubuntu: ~/workspace/linux-stable# sudo bpftrace -e 'kretprobe:policy_nodemask {printf("[pid-%d:%s]: policy_nodemask retval %p\n", pid,comm, retval)}'

Attaching 1 probe...
[pid-2326:gnome-terminal-]: policy_nodemask retval (nil)
[pid-1290:gnome-shell]: policy_nodemask retval (nil)
[pid-2326:gnome-terminal-]: policy_nodemask retval (nil)
[pid-22642:bpftrace]: policy_nodemask retval (nil)
[pid-1290:gnome-shell]: policy_nodemask retval (nil)
[pid-1290:gnome-shell]: policy_nodemask retval (nil)
```














