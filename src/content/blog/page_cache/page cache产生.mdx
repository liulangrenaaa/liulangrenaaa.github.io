---
title: page cache如何产生的
date: 2020-09-07 19:00:00
tags:
    - 文件系统
    - page_cache
categories:
    - linux内核
slug: "page_cache/page-cache产生"
---


## WHY Page cache?

CPU如果要访问外部磁盘上的文件，需要首先将这些文件的内容拷贝到内存中，由于硬件的限制，
从磁盘到内存的数据传输速度是很慢的，如果现在物理内存有空余，干嘛不用这些空闲内存来缓存一些磁盘的文件内容呢，
这部分用作缓存磁盘文件的内存就叫做page cache。

用户进程启动read()系统调用后，内核会首先查看page cache里有没有用户要读取的文件内容，
如果有（cache hit），那就直接读取，没有的话（cache miss）再启动I/O操作从磁盘上读取，
然后放到page cache中，下次再访问这部分内容的时候，就又可以cache hit，
不用忍受磁盘的龟速了（相比内存慢几个数量级）。

由此可见 page_cache 会对 磁盘性能，应用性能有极大提高

但是相对于磁盘，内存的容量还是很有限的，所以没必要缓存整个文件，
只需要当文件的某部分内容真正被访问到时，再将这部分内容调入内存缓存起来就可以了，
这种方式叫做demand paging（按需调页），把对需求的满足延迟到最后一刻，很懒很实用。


## Page cache 组成

### file
`Page cache` 是文件部分或者全部在内核中缓存的部分，首先需要了解 文件在磁盘和linux中的表现:

1. 在磁盘等存储介质上，文件都是分块存储在磁盘上的， `磁盘inode` 是文件唯一标识。
2. linux系统中为了表示文件，也有文件系统inode，一般会跟文件系统相关，是 从物理磁盘 `inode` 读取到内存之后的形态
3. linux系统中虚拟文件系统VFS以实现多文件系统支持，vfs inode是VFS层文件内存数据结构，大多数是所有 文件系统 inode 公共成员

ext4 fs for example:
```
/*
 * fourth extended file system inode data in memory
 */
struct ext4_inode_info {
	__le32	i_data[15];	/* unconverted */
	__u32	i_dtime;
	ext4_fsblk_t	i_file_acl;
	struct rw_semaphore xattr_sem;

	struct list_head i_orphan;	/* unlinked but open inodes */
	struct rw_semaphore i_data_sem;
	struct inode vfs_inode;
	struct jbd2_inode *jinode;
```
`ext4_inode_info` 就是对应文件系统inode,  `vfs_inode` 就是 vfs层的inode.


```
/*
 * Structure of an inode on the disk
 */
struct ext4_inode {
	__le16	i_mode;		/* File mode */
	__le16	i_uid;		/* Low 16 bits of Owner Uid */
	__le32	i_size_lo;	/* Size in bytes */
	__le32	i_atime;	/* Access time */
	__le32	i_ctime;	/* Inode Change time */
	__le32	i_mtime;	/* Modification time */
	__le32	i_dtime;	/* Deletion Time */
	__le16	i_gid;		/* Low 16 bits of Group Id */
	__le16	i_links_count;	/* Links count */
	__le32	i_blocks_lo;	/* Blocks count */
    .....
```
`ext4_inode` 就是对应 物理磁盘的inode. 大多数成员是 记录和物理磁盘 和 物理文件真实 相关的信息


### address_space
实际情况中，一个文件可能有 100M - 10G这么大，kernel会给文件在内存中分配很多`page cache`,这些pagecache
是如何管理起来的呢，这就引出了 第二个主要结构 `address_space` -- `地址空间`。


首先看 address_space 定义
```
/**
 * struct address_space - Contents of a cacheable, mappable object.
 * @host: Owner, either the inode or the block_device.
 * @i_pages: Cached pages.
 * @gfp_mask: Memory allocation flags to use for allocating pages.
 * @i_mmap_writable: Number of VM_SHARED mappings.
 * @nr_thps: Number of THPs in the pagecache (non-shmem only).
 * @i_mmap: Tree of private and shared mappings.
 * @i_mmap_rwsem: Protects @i_mmap and @i_mmap_writable.
 * @nrpages: Number of page entries, protected by the i_pages lock.
 * @nrexceptional: Shadow or DAX entries, protected by the i_pages lock.
 * @writeback_index: Writeback starts here.
 * @a_ops: Methods.
 * @flags: Error bits and flags (AS_*).
 * @wb_err: The most recent error which has occurred.
 * @private_lock: For use by the owner of the address_space.
 * @private_list: For use by the owner of the address_space.
 * @private_data: For use by the owner of the address_space.
 */
struct address_space {
	struct inode		*host;                      //一般就是 inode 与 文件关联
	struct xarray		i_pages;                    // xarray 管理着这个地址空间里面所有的 page,之前kernel版本是 radix tree
	gfp_t			gfp_mask;
	atomic_t		i_mmap_writable;
#ifdef CONFIG_READ_ONLY_THP_FOR_FS
	/* number of thp, only for non-shmem files */
	atomic_t		nr_thps;
#endif
	struct rb_root_cached	i_mmap;                 // i_mmap 红黑树的根节点，会将 page 按照 某种？ 序列组织起来，便于查找
	struct rw_semaphore	i_mmap_rwsem;
	unsigned long		nrpages;
	unsigned long		nrexceptional;
	pgoff_t			writeback_index;
	const struct address_space_operations *a_ops;
	unsigned long		flags;
	errseq_t		wb_err;
	spinlock_t		private_lock;
	struct list_head	private_list;
	void			*private_data;
} __attribute__((aligned(sizeof(long)))) __randomize_layout;
```

这个定义没有 `inode` 那么长，但是很核心

这样 `inode` 与 many `pages` 通过 `address_space` 的 `host` 与 `i_pages` 成员 相互连接起来。

其中 inode 既可以是 磁盘文件的 inode，也可以是 内存文件系统 的 inode（proc sys等）
还可以是 swap 文件的 inode.

`a_ops` 同样也是一个基类指针，定义了抽象的文件系统交互接口，由具体文件系统负责实现。
例如如果文件是存储在ext4文件系统之上，那么该结构便被初始化为 `ext4_aops` （见fs/ext4/inode.c）。


如何查找 一个文件的page_cache?
inode --> address_space: container_of 通过inode 找到 地址空间
address_space --> i_pages: 成员变量访问

address_space 是Linux内核中的一个关键抽象，它是页缓存和外部设备中文件系统的桥梁。

上层应用读取数据会进入到该结构内的page cache，上层应用对文件的写入内容也会缓存于该结构内的page cache。


$$ 这里配图



## dentry
这和 pagecache 关系没有那密切。

假如需要查找 `/etc/apt/aaa` 这个文件，linux系统会如何去查找呢？
文件目录这些信息就涉及到 `dentry` 的信息了，dentry也是实现Linux文件系统目录层次结构的关键.

`dentry` 从另外一个层面描述文件：文件名. 更准确地说，是保存文件名和文件inode号

与 `inode` 一样， `dentry` 除了VFS层dentry结构，每种具体文件系统也有自身的内存dentry和 磁盘dentry结构

ext4 fs for example:
```
struct dentry {
	/* RCU lookup touched fields */
	unsigned int d_flags;		/* protected by d_lock */
	seqcount_spinlock_t d_seq;	/* per dentry seqlock */
	struct hlist_bl_node d_hash;	/* lookup hash list */
	struct dentry *d_parent;	/* parent directory */
	struct qstr d_name;
	struct inode *d_inode;		/* Where the name belongs to - NULL is
					 * negative */
	unsigned char d_iname[DNAME_INLINE_LEN];	/* small names */

	/* Ref lookup also touches following */
	struct lockref d_lockref;	/* per-dentry lock and refcount */
	const struct dentry_operations *d_op;
	struct super_block *d_sb;	/* The root of the dentry tree */
	unsigned long d_time;		/* used by d_revalidate */
	void *d_fsdata;			/* fs-specific data */

	union {
		struct list_head d_lru;		/* LRU list */
		wait_queue_head_t *d_wait;	/* in-lookup ones only */
	};
	struct list_head d_child;	/* child of parent list */
	struct list_head d_subdirs;	/* our children */
	/*
	 * d_alias and d_rcu can share memory
	 */
	union {
		struct hlist_node d_alias;	/* inode alias list */
		struct hlist_bl_node d_in_lookup_hash;	/* only for in-lookup ones */
	 	struct rcu_head d_rcu;
	} d_u;
} __randomize_layout;

/*
 * The new version of the directory entry.  Since EXT4 structures are
 * stored in intel byte order, and the name_len field could never be
 * bigger than 255 chars, it's safe to reclaim the extra byte for the
 * file_type field.
 */
struct ext4_dir_entry_2 {
	__le32	inode;			/* Inode number */
	__le16	rec_len;		/* Directory entry length */
	__u8	name_len;		/* Name length */
	__u8	file_type;		/* See file type macros EXT4_FT_* below */
	char	name[EXT4_NAME_LEN];	/* File name */
};
```

在ext4中内存与磁盘dentry结构  `ext4_dir_entry_2` 看起来保持了一致。磁盘文件系统dentry也必须被持久化存储在磁盘上。