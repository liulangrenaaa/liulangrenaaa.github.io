---
title: mmap_sem可扩展问题
date: 2020-09-14 19:00:00
tags:
    - 内核同步
    - 锁粒度
categories:
    - linux内核
---

在 Linux 中，同进程的不同线程虽然对应不同的 task_struct ，但都共享同一个 mm_struct ，即 task_struct::mm 指向同一个变量，其描述了该进程的整个虚拟地址空间。

mm_struct 包含的主要成员如下：
```
struct mm_struct {
  struct vm_area_struct *mmap;    /* list of VMAs */
  struct rb_root mm_rb;
  pgd_t * pgd;
  struct rw_semaphore mmap_sem;
...
};
```
其中， mmap 指向了 vm_area_struct 双向链表，每个 vm_area_struct (VMA) 描述了虚拟地址空间的一个区间，比如 text / data / bss / heap / stack 各对应一个 VMA ，mmap 每次调用会产生 VMA(如果可和之前合并的话则不会产生新 VMA)。同时为了加速 VMA 查找，vm_area_struct 之间亦通过红黑树串起来，通过 mm_rb 指向。

接下来就是大家都很熟悉的页表，在 x86_64 下，分页采用 PGD - PUD - PMD - PTE 四级页表，在此通过 pgd 指向 PGD 页表项。

mmap_sem 是一把很大的锁 (信号量)，进程内大部分的内存操作都需要拿它：

所有对 VMA 的操作 (mmap、munmap)
所有对页表的修改 (page fault 等)
madvise (如 jemalloc 经常使用的 MADV_DONTNEED)

## Problem
某业务进程包含若干个工作线程和一个数据加载线程，每隔一段时间数据加载线程会映射一份新的数据到内存供工作线程使用，并负责将工作线程不再使用的上一份数据释放。结果发现在释放期间，工作线程受到了影响，导致失败率上升。通过一波分析后发现是 mummap 大块内存 (20G+) 造成的。

我们来看内核中 munmap 的实现：
```
SYSCALL_DEFINE2(munmap, unsigned long, addr, size_t, len)
{
  int ret;
  struct mm_struct *mm = current->mm;

  profile_munmap(addr);
  if (down_write_killable(&mm->mmap_sem))
    return -EINTR;
  ret = do_munmap(mm, addr, len);
  up_write(&mm->mmap_sem);
  return ret;
}
```

可以发现刚进来就把 mmap_sem 的写锁拿上了，然后执行 do_munmap ：

```
int do_munmap(struct mm_struct *mm, unsigned long start, size_t len)
{
  unsigned long end;
  struct vm_area_struct *vma, *prev, *last;

  if ((offset_in_page(start)) || start > TASK_SIZE || len > TASK_SIZE-start)
    return -EINVAL;

  len = PAGE_ALIGN(len);
  if (len == 0)
    return -EINVAL;

  /* Find the first overlapping VMA */
  vma = find_vma(mm, start);
  if (!vma)
    return 0;
  prev = vma->vm_prev;
  /* we have  start < vma->vm_end  */

  /* if it doesn't overlap, we have nothing.. */
  end = start + len;
  if (vma->vm_start >= end)
    return 0;

  /*
   * If we need to split any vma, do it now to save pain later.
   *
   * Note: mremap's move_vma VM_ACCOUNT handling assumes a partially
   * unmapped vm_area_struct will remain in use: so lower split_vma
   * places tmp vma above, and higher split_vma places tmp vma below.
   */
  if (start > vma->vm_start) {
    int error;

    /*
     * Make sure that map_count on return from munmap() will
     * not exceed its limit; but let map_count go just above
     * its limit temporarily, to help free resources as expected.
     */
    if (end < vma->vm_end && mm->map_count >= sysctl_max_map_count)
      return -ENOMEM;

    error = __split_vma(mm, vma, start, 0);
    if (error)
      return error;
    prev = vma;
  }

  /* Does it split the last one? */
  last = find_vma(mm, end);
  if (last && end > last->vm_start) {
    int error = __split_vma(mm, last, end, 1);
    if (error)
      return error;
  }
  vma = prev ? prev->vm_next : mm->mmap;

  /*
   * unlock any mlock()ed ranges before detaching vmas
   */
  if (mm->locked_vm) {
    struct vm_area_struct *tmp = vma;
    while (tmp && tmp->vm_start < end) {
      if (tmp->vm_flags & VM_LOCKED) {
        mm->locked_vm -= vma_pages(tmp);
        munlock_vma_pages_all(tmp);
      }
      tmp = tmp->vm_next;
    }
  }

  /*
   * Remove the vma's, and unmap the actual pages
   */
  detach_vmas_to_be_unmapped(mm, vma, prev, end);
  unmap_region(mm, vma, prev, start, end);

  arch_unmap(mm, vma, start, end);

  /* Fix up all other VM information */
  remove_vma_list(mm, vma);

  return 0;
}
```

个函数做了很多事：首先通过 find_vma 找到 start 到 end 之间相应的 VMA ，必要时通过 __split_vma 对 VMA 进行切分。随后将 VMA 从链表和红黑树中移除，并对移除的区域调用 unmap_region => free_pgtables 清空该区域对应的页表项。

对于 mummap 大块内存 (20G+) 这样的操作，其中最耗时的应该是 free_pgtables ：20G 内存对应 20 * 1024 * 1024 / 4 = 5242880 个 4KB 页，要清空这 5242880 个页的页表项无疑是非常耗时的，实测需要好几秒。在此期间，进程的 mmap_sem 的写锁一直被拿住，导致其他线程的对内存的相关操作阻塞在 mmap_sem 锁上，从而导致了性能抖动。

为了解决这个问题，同事实现了分段 unmap ：在业务程序对 munmap 再进行一层封装，当遇到大块内存释放时，将内存切分成若干段，比如 128MB 一段，依次对每段调用 munmap ，并在调用后 sleep 若干毫秒，这样避免了长时间拿 mmap_sem ，卡住其他工作进程导致影响服务质量的问题。和 Yang Shi 在 Drop mmap_sem during unmapping large map 提出的内核态实现有异曲同工之妙。

## 总结
从用户的角度来看，一个线程不应该受到另外一个线程的干扰。然而从这次的 case 来看，多个线程对进程级共享的 mmap_sem 的竞争是问题产生的主要原因，换句话说，mmap_sem 管太多，导致干啥都要拿它，从而限制了进程的可扩展性。

能否换用更细粒度的锁？Laurent DUFOUR 在 LPC2019 上提出用 VMA 层级的锁来取代 mmap_sem ，这样在上述的 case 中数据加载线程只会拿住 20G 内存对应的 VMA 锁，而不会影响到早已不使用这块内存的其他工作线程。当然，换用更细粒度的锁带来的就是内核实现上复杂度的提升，比如需要遵循一些规则来避免死锁。

参考：
[mmap_sem 的可扩展性](https://www.binss.me/blog/the-scalability-of-mmap_sem/)
[LWN文章](https://lwn.net/Articles/753269/)
[PDF文档](https://linuxplumbersconf.org/event/4/contributions/279/attachments/302/512/vma_locking.pdf)