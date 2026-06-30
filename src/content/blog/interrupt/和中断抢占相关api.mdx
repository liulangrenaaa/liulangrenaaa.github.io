---
title: 和中断抢占相关api
date: 2021-03-04 19:00:40
tags:
    - intrrrupt
    - preemption
categories:
    - linux内核
slug: "interrupt/和中断抢占相关api"
---



## 开关关中断api
api1:
```
#define local_irq_enable()	do { raw_local_irq_enable(); } while (0)
#define local_irq_disable()	do { raw_local_irq_disable(); } while (0)
```

api2:
```
#define local_irq_save(flags)	do { raw_local_irq_save(flags); } while (0)
#define local_irq_restore(flags) do { raw_local_irq_restore(flags); } while (0)
```



## __this_cpu_read && this_cpu_read
### 中断上下文
可以在中断上下文中使用，无需考虑被中断或者进程强占
```
/*
 * Operations for contexts that are safe from preemption/interrupts.  These
 * operations verify that preemption is disabled.
 */
#define __this_cpu_read(pcp)						\
({									\
	__this_cpu_preempt_check("read");				\
	raw_cpu_read(pcp);						\
})

#define __this_cpu_write(pcp, val)					\
({									\
	__this_cpu_preempt_check("write");				\
	raw_cpu_write(pcp, val);					\
})
```

### 进程上下文
可以在进程上下文中使用，实现了 强占、中断保护
```
/*
 * Operations with implied preemption/interrupt protection.  These
 * operations can be used without worrying about preemption or interrupt.
 */
#define this_cpu_read(pcp)		__pcpu_size_call_return(this_cpu_read_, pcp)
#define this_cpu_write(pcp, val)	__pcpu_size_call(this_cpu_write_, pcp, val)
```

参考[patch1](https://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git/commit/?id=8afecaa68df1e94a9d634f1f961533a925f239fc)
参考[patch2](https://git.kernel.org/pub/scm/linux/kernel/git/next/linux-next.git/commit/?id=17c891ab349138e8d8a59ca2700f42ce8af96f4e)











