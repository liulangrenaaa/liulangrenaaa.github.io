---
title: static_key机制
date: 2021-09-14 19:00:00
tags:
    - static_key
categories:
    - kernel debug
---

还没有完全看懂 5.14 版本的 static-key 机制，
这里仅仅做个记录


## 概览
内核中有很多判断条件在正常情况下的结果都是固定的，除非极其罕见的场景才会改变，
通常单个的这种判断的代价很低可以忽略，但是如果这种判断数量巨大且被频繁执行，
那就会带来性能损失了。内核的static-key机制就是为了优化这种场景,其优化的结果是：
对于大多数情况，对应的判断被优化为一个NOP指令，在非常有限的场景就变成jump XXX一类的指令，
使得对应的代码段得到执行。

典型场景就是 `tracepoint` 机制中。

## demo
在 `mm` 目录下找一个内有两个 `tracepoint` 的函数--`compact_zone`

`compact_zone`  内部有三个`tracepoint`:
```
static enum compact_result
compact_zone(struct compact_control *cc, struct capture_control *capc)
{
        ......
	trace_mm_compaction_begin(start_pfn, cc->migrate_pfn,
				cc->free_pfn, end_pfn, sync);
        ......
		trace_mm_compaction_migratepages(cc->nr_migratepages, err,
							&cc->migratepages);
        ......
	trace_mm_compaction_end(start_pfn, cc->migrate_pfn,
				cc->free_pfn, end_pfn, sync, ret);

	return ret;
```

normal 情况下 crash, compact_zone 的汇编是：
```
0xffffffff8242f820 <compact_zone>:	push   %r15
0xffffffff8242f822 <compact_zone+2>:	push   %r14
0xffffffff8242f824 <compact_zone+4>:	mov    %rdi,%r14
0xffffffff8242f827 <compact_zone+7>:	push   %r13
0xffffffff8242f829 <compact_zone+9>:	push   %r12
0xffffffff8242f82b <compact_zone+11>:	push   %rbp
0xffffffff8242f82c <compact_zone+12>:	push   %rbx
0xffffffff8242f82d <compact_zone+13>:	sub    $0x88,%rsp
0xffffffff8242f834 <compact_zone+20>:	mov    0x40(%rdi),%rdi
0xffffffff8242f838 <compact_zone+24>:	mov    0x70(%r14),%ebp
0xffffffff8242f83c <compact_zone+28>:	mov    %rsi,0x28(%rsp)
0xffffffff8242f841 <compact_zone+33>:	mov    0x80(%rdi),%rbx
0xffffffff8242f848 <compact_zone+40>:	mov    %gs:0x28,%rax
0xffffffff8242f851 <compact_zone+49>:	mov    %rax,0x80(%rsp)
0xffffffff8242f859 <compact_zone+57>:	xor    %eax,%eax
0xffffffff8242f85b <compact_zone+59>:	mov    0x70(%rdi),%rax
0xffffffff8242f85f <compact_zone+63>:	mov    %r14,(%r14)
0xffffffff8242f862 <compact_zone+66>:	mov    0x18b66d7(%rip),%r12d        # 0xffffffff83ce5f40
0xffffffff8242f869 <compact_zone+73>:	movq   $0x0,0x48(%r14)
0xffffffff8242f871 <compact_zone+81>:	mov    %rax,0x30(%rsp)
0xffffffff8242f876 <compact_zone+86>:	lea    0x10(%r14),%rax
0xffffffff8242f87a <compact_zone+90>:	mov    %rax,0x20(%rsp)
0xffffffff8242f87f <compact_zone+95>:	mov    %rax,0x10(%r14)
0xffffffff8242f883 <compact_zone+99>:	mov    %rax,0x18(%r14)
0xffffffff8242f887 <compact_zone+103>:	mov    0x5c(%r14),%eax
0xffffffff8242f88b <compact_zone+107>:	movq   $0x0,0x50(%r14)
0xffffffff8242f893 <compact_zone+115>:	movq   $0x0,0x20(%r14)
0xffffffff8242f89b <compact_zone+123>:	mov    %r14,0x8(%r14)
0xffffffff8242f89f <compact_zone+127>:	test   %r12d,%r12d
0xffffffff8242f8a2 <compact_zone+130>:	jne    0xffffffff8243062d <compact_zone+3597>
0xffffffff8242f8a8 <compact_zone+136>:	shr    $0x3,%eax
0xffffffff8242f8ab <compact_zone+139>:	and    $0x3,%eax
0xffffffff8242f8ae <compact_zone+142>:	mov    0x68(%r14),%edx
0xffffffff8242f8b2 <compact_zone+146>:	mov    0x6c(%r14),%ecx
0xffffffff8242f8b6 <compact_zone+150>:	mov    %eax,0x64(%r14)
0xffffffff8242f8ba <compact_zone+154>:	mov    0x60(%r14),%esi
0xffffffff8242f8be <compact_zone+158>:	callq  0xffffffff8242f710 <compaction_suitable>
0xffffffff8242f8c3 <compact_zone+163>:	cmp    $0x8,%eax
0xffffffff8242f8c6 <compact_zone+166>:	mov    %eax,%r12d
0xffffffff8242f8c9 <compact_zone+169>:	sete   %dl
0xffffffff8242f8cc <compact_zone+172>:	cmp    $0x1,%eax
0xffffffff8242f8cf <compact_zone+175>:	sete   %al
0xffffffff8242f8d2 <compact_zone+178>:	or     %al,%dl
0xffffffff8242f8d4 <compact_zone+180>:	jne    0xffffffff8242fccd <compact_zone+1197>
0xffffffff8242f8da <compact_zone+186>:	mov    0x40(%r14),%rdi
0xffffffff8242f8de <compact_zone+190>:	mov    0x478(%rdi),%eax
0xffffffff8242f8e4 <compact_zone+196>:	cmp    %eax,0x60(%r14)
0xffffffff8242f8e8 <compact_zone+200>:	jl     0xffffffff8242f8f7 <compact_zone+215>
0xffffffff8242f8ea <compact_zone+202>:	cmpl   $0x6,0x474(%rdi)
0xffffffff8242f8f1 <compact_zone+209>:	je     0xffffffff8243050d <compact_zone+3309>
0xffffffff8242f8f7 <compact_zone+215>:	mov    0x30(%rsp),%rdx
0xffffffff8242f8fc <compact_zone+220>:	mov    %rbx,%rax
0xffffffff8242f8ff <compact_zone+223>:	xor    %edi,%edi
0xffffffff8242f901 <compact_zone+225>:	movq   $0x0,0x38(%r14)
0xffffffff8242f909 <compact_zone+233>:	add    %rdx,%rax
0xffffffff8242f90c <compact_zone+236>:	test   %ebp,%ebp
0xffffffff8242f90e <compact_zone+238>:	setne  %dil
0xffffffff8242f912 <compact_zone+242>:	cmpb   $0x0,0x79(%r14)
0xffffffff8242f917 <compact_zone+247>:	mov    %rax,0x50(%rsp)
0xffffffff8242f91c <compact_zone+252>:	mov    %edi,0x68(%rsp)
0xffffffff8242f920 <compact_zone+256>:	je     0xffffffff8242fcf9 <compact_zone+1241>
0xffffffff8242f926 <compact_zone+262>:	lea    -0x1(%rax),%rcx
0xffffffff8242f92a <compact_zone+266>:	mov    %rdx,0x30(%r14)
0xffffffff8242f92e <compact_zone+270>:	and    $0xfffffffffffffe00,%rcx
0xffffffff8242f935 <compact_zone+277>:	mov    %rcx,0x28(%r14)
0xffffffff8242f939 <compact_zone+281>:	movb   $0x0,0x4b(%rsp)
0xffffffff8242f93e <compact_zone+286>:	test   %ebp,%ebp
0xffffffff8242f940 <compact_zone+288>:	jne    0xffffffff8242f959 <compact_zone+313>
0xffffffff8242f942 <compact_zone+290>:	mov    0x40(%r14),%rax
0xffffffff8242f946 <compact_zone+294>:	mov    0x458(%rax),%rbx
0xffffffff8242f94d <compact_zone+301>:	cmp    %rbx,0x450(%rax)
0xffffffff8242f954 <compact_zone+308>:	sete   0x4b(%rsp)
0xffffffff8242f959 <compact_zone+313>:	nopl   0x0(%rax,%rax,1)
0xffffffff8242f95e <compact_zone+318>:	mov    %gs:0x7dbe1c03(%rip),%eax        # 0x11568
0xffffffff8242f965 <compact_zone+325>:	mov    %eax,%eax
......
0xffffffff8242fc92 <compact_zone+1138>:	add    %rax,%gs:0x7ddb566e(%rip)        # 0x1e5308
0xffffffff8242fc9a <compact_zone+1146>:	nopl   0x0(%rax,%rax,1)
0xffffffff8242fc9f <compact_zone+1151>:	mov    %gs:0x7dbe18c2(%rip),%eax        # 0x11568
0xffffffff8242fca6 <compact_zone+1158>:	mov    %eax,%eax
0xffffffff8242fca8 <compact_zone+1160>:	bt     %rax,0x18b59a0(%rip)        # 0xffffffff83ce5650
0xffffffff8242fcb0 <compact_zone+1168>:	jae    0xffffffff8242fccd <compact_zone+1197>
0xffffffff8242fcb2 <compact_zone+1170>:	incl   %gs:0x7dbe7247(%rip)        # 0x16f00
0xffffffff8242fcb9 <compact_zone+1177>:	mov    0x188ed40(%rip),%rax        # 0xffffffff83cbea00
0xffffffff8242fcc0 <compact_zone+1184>:	decl   %gs:0x7dbe7239(%rip)        # 0x16f00
0xffffffff8242fcc7 <compact_zone+1191>:	je     0xffffffff8243063e <compact_zone+3614>
0xffffffff8242fccd <compact_zone+1197>:	mov    0x80(%rsp),%rax
0xffffffff8242fcd5 <compact_zone+1205>:	sub    %gs:0x28,%rax
0xffffffff8242fcde <compact_zone+1214>:	jne    0xffffffff82430687 <compact_zone+3687>
0xffffffff8242fce4 <compact_zone+1220>:	add    $0x88,%rsp
0xffffffff8242fceb <compact_zone+1227>:	mov    %r12d,%eax
0xffffffff8242fcee <compact_zone+1230>:	pop    %rbx
0xffffffff8242fcef <compact_zone+1231>:	pop    %rbp
0xffffffff8242fcf0 <compact_zone+1232>:	pop    %r12
0xffffffff8242fcf2 <compact_zone+1234>:	pop    %r13
0xffffffff8242fcf4 <compact_zone+1236>:	pop    %r14
0xffffffff8242fcf6 <compact_zone+1238>:	pop    %r15
```


接下来打开 `trace_mm_compaction_begin` 和 `trace_mm_compaction_end` 两个tracepoint 点，然后crash
```
0xffffffff8ce2f820 <compact_zone>:	push   %r15
0xffffffff8ce2f822 <compact_zone+2>:	push   %r14
0xffffffff8ce2f824 <compact_zone+4>:	mov    %rdi,%r14
0xffffffff8ce2f827 <compact_zone+7>:	push   %r13
0xffffffff8ce2f829 <compact_zone+9>:	push   %r12
0xffffffff8ce2f82b <compact_zone+11>:	push   %rbp
0xffffffff8ce2f82c <compact_zone+12>:	push   %rbx
0xffffffff8ce2f82d <compact_zone+13>:	sub    $0x88,%rsp
0xffffffff8ce2f834 <compact_zone+20>:	mov    0x40(%rdi),%rdi
0xffffffff8ce2f838 <compact_zone+24>:	mov    0x70(%r14),%ebp
0xffffffff8ce2f83c <compact_zone+28>:	mov    %rsi,0x28(%rsp)
0xffffffff8ce2f841 <compact_zone+33>:	mov    0x80(%rdi),%rbx
0xffffffff8ce2f848 <compact_zone+40>:	mov    %gs:0x28,%rax
0xffffffff8ce2f851 <compact_zone+49>:	mov    %rax,0x80(%rsp)
0xffffffff8ce2f859 <compact_zone+57>:	xor    %eax,%eax
0xffffffff8ce2f85b <compact_zone+59>:	mov    0x70(%rdi),%rax
0xffffffff8ce2f85f <compact_zone+63>:	mov    %r14,(%r14)
0xffffffff8ce2f862 <compact_zone+66>:	mov    0x18b66d7(%rip),%r12d        # 0xffffffff8e6e5f40
0xffffffff8ce2f869 <compact_zone+73>:	movq   $0x0,0x48(%r14)
0xffffffff8ce2f871 <compact_zone+81>:	mov    %rax,0x30(%rsp)
0xffffffff8ce2f876 <compact_zone+86>:	lea    0x10(%r14),%rax
0xffffffff8ce2f87a <compact_zone+90>:	mov    %rax,0x20(%rsp)
0xffffffff8ce2f87f <compact_zone+95>:	mov    %rax,0x10(%r14)
0xffffffff8ce2f883 <compact_zone+99>:	mov    %rax,0x18(%r14)
0xffffffff8ce2f887 <compact_zone+103>:	mov    0x5c(%r14),%eax
0xffffffff8ce2f88b <compact_zone+107>:	movq   $0x0,0x50(%r14)
0xffffffff8ce2f893 <compact_zone+115>:	movq   $0x0,0x20(%r14)
0xffffffff8ce2f89b <compact_zone+123>:	mov    %r14,0x8(%r14)
0xffffffff8ce2f89f <compact_zone+127>:	test   %r12d,%r12d
0xffffffff8ce2f8a2 <compact_zone+130>:	jne    0xffffffff8ce3062d <compact_zone+3597>
0xffffffff8ce2f8a8 <compact_zone+136>:	shr    $0x3,%eax
0xffffffff8ce2f8ab <compact_zone+139>:	and    $0x3,%eax
0xffffffff8ce2f8ae <compact_zone+142>:	mov    0x68(%r14),%edx
0xffffffff8ce2f8b2 <compact_zone+146>:	mov    0x6c(%r14),%ecx
0xffffffff8ce2f8b6 <compact_zone+150>:	mov    %eax,0x64(%r14)
0xffffffff8ce2f8ba <compact_zone+154>:	mov    0x60(%r14),%esi
0xffffffff8ce2f8be <compact_zone+158>:	callq  0xffffffff8ce2f710 <compaction_suitable>
0xffffffff8ce2f8c3 <compact_zone+163>:	cmp    $0x8,%eax
0xffffffff8ce2f8c6 <compact_zone+166>:	mov    %eax,%r12d
0xffffffff8ce2f8c9 <compact_zone+169>:	sete   %dl
0xffffffff8ce2f8cc <compact_zone+172>:	cmp    $0x1,%eax
0xffffffff8ce2f8cf <compact_zone+175>:	sete   %al
0xffffffff8ce2f8d2 <compact_zone+178>:	or     %al,%dl
0xffffffff8ce2f8d4 <compact_zone+180>:	jne    0xffffffff8ce2fccd <compact_zone+1197>
0xffffffff8ce2f8da <compact_zone+186>:	mov    0x40(%r14),%rdi
0xffffffff8ce2f8de <compact_zone+190>:	mov    0x478(%rdi),%eax
0xffffffff8ce2f8e4 <compact_zone+196>:	cmp    %eax,0x60(%r14)
0xffffffff8ce2f8e8 <compact_zone+200>:	jl     0xffffffff8ce2f8f7 <compact_zone+215>
0xffffffff8ce2f8ea <compact_zone+202>:	cmpl   $0x6,0x474(%rdi)
0xffffffff8ce2f8f1 <compact_zone+209>:	je     0xffffffff8ce3050d <compact_zone+3309>
0xffffffff8ce2f8f7 <compact_zone+215>:	mov    0x30(%rsp),%rdx
0xffffffff8ce2f8fc <compact_zone+220>:	mov    %rbx,%rax
0xffffffff8ce2f8ff <compact_zone+223>:	xor    %edi,%edi
0xffffffff8ce2f901 <compact_zone+225>:	movq   $0x0,0x38(%r14)
0xffffffff8ce2f909 <compact_zone+233>:	add    %rdx,%rax
0xffffffff8ce2f90c <compact_zone+236>:	test   %ebp,%ebp
0xffffffff8ce2f90e <compact_zone+238>:	setne  %dil
0xffffffff8ce2f912 <compact_zone+242>:	cmpb   $0x0,0x79(%r14)
0xffffffff8ce2f917 <compact_zone+247>:	mov    %rax,0x50(%rsp)
0xffffffff8ce2f91c <compact_zone+252>:	mov    %edi,0x68(%rsp)
0xffffffff8ce2f920 <compact_zone+256>:	je     0xffffffff8ce2fcf9 <compact_zone+1241>
0xffffffff8ce2f926 <compact_zone+262>:	lea    -0x1(%rax),%rcx
0xffffffff8ce2f92a <compact_zone+266>:	mov    %rdx,0x30(%r14)
0xffffffff8ce2f92e <compact_zone+270>:	and    $0xfffffffffffffe00,%rcx
0xffffffff8ce2f935 <compact_zone+277>:	mov    %rcx,0x28(%r14)
0xffffffff8ce2f939 <compact_zone+281>:	movb   $0x0,0x4b(%rsp)
0xffffffff8ce2f93e <compact_zone+286>:	test   %ebp,%ebp
0xffffffff8ce2f940 <compact_zone+288>:	jne    0xffffffff8ce2f959 <compact_zone+313>
0xffffffff8ce2f942 <compact_zone+290>:	mov    0x40(%r14),%rax
0xffffffff8ce2f946 <compact_zone+294>:	mov    0x458(%rax),%rbx
0xffffffff8ce2f94d <compact_zone+301>:	cmp    %rbx,0x450(%rax)
0xffffffff8ce2f954 <compact_zone+308>:	sete   0x4b(%rsp)
0xffffffff8ce2f959 <compact_zone+313>:	jmpq   0xffffffff8ce30375 <compact_zone+2901>
0xffffffff8ce2f95e <compact_zone+318>:	mov    %gs:0x731e1c03(%rip),%eax        # 0x11568
0xffffffff8ce2f965 <compact_zone+325>:	mov    %eax,%eax
......
0xffffffff8ce2fc92 <compact_zone+1138>:	add    %rax,%gs:0x733b566e(%rip)        # 0x1e5308
0xffffffff8ce2fc9a <compact_zone+1146>:	jmpq   0xffffffff8ce303ce <compact_zone+2990>
0xffffffff8ce2fc9f <compact_zone+1151>:	mov    %gs:0x731e18c2(%rip),%eax        # 0x11568
0xffffffff8ce2fca6 <compact_zone+1158>:	mov    %eax,%eax
0xffffffff8ce2fca8 <compact_zone+1160>:	bt     %rax,0x18b59a0(%rip)        # 0xffffffff8e6e5650
0xffffffff8ce2fcb0 <compact_zone+1168>:	jae    0xffffffff8ce2fccd <compact_zone+1197>
0xffffffff8ce2fcb2 <compact_zone+1170>:	incl   %gs:0x731e7247(%rip)        # 0x16f00
0xffffffff8ce2fcb9 <compact_zone+1177>:	mov    0x188ed40(%rip),%rax        # 0xffffffff8e6bea00
0xffffffff8ce2fcc0 <compact_zone+1184>:	decl   %gs:0x731e7239(%rip)        # 0x16f00
0xffffffff8ce2fcc7 <compact_zone+1191>:	je     0xffffffff8ce3063e <compact_zone+3614>
0xffffffff8ce2fccd <compact_zone+1197>:	mov    0x80(%rsp),%rax
0xffffffff8ce2fcd5 <compact_zone+1205>:	sub    %gs:0x28,%rax
0xffffffff8ce2fcde <compact_zone+1214>:	jne    0xffffffff8ce30687 <compact_zone+3687>
0xffffffff8ce2fce4 <compact_zone+1220>:	add    $0x88,%rsp
0xffffffff8ce2fceb <compact_zone+1227>:	mov    %r12d,%eax
0xffffffff8ce2fcee <compact_zone+1230>:	pop    %rbx
0xffffffff8ce2fcef <compact_zone+1231>:	pop    %rbp
0xffffffff8ce2fcf0 <compact_zone+1232>:	pop    %r12
0xffffffff8ce2fcf2 <compact_zone+1234>:	pop    %r13
0xffffffff8ce2fcf4 <compact_zone+1236>:	pop    %r14
0xffffffff8ce2fcf6 <compact_zone+1238>:	pop    %r15
```

可以看出来两处不一样
```
0xffffffff8242f959 <compact_zone+313>:	nopl   0x0(%rax,%rax,1)
0xffffffff8242fc9a <compact_zone+1146>:	nopl   0x0(%rax,%rax,1)
```

```
0xffffffff8ce2f959 <compact_zone+313>:	jmpq   0xffffffff8ce30375 <compact_zone+2901>
0xffffffff8ce2fc9a <compact_zone+1146>:	jmpq   0xffffffff8ce303ce <compact_zone+2990>
```

## demo2
总觉得用 `tracepoint` 来实现有些不好，还是手动写个demo

```
ubuntu@zeku_server:~/workspace/linux $ git diff
diff --git a/mm/compaction.c b/mm/compaction.c
index bfc93da1c2c7..13513d807f86 100644
--- a/mm/compaction.c
+++ b/mm/compaction.c
@@ -2896,6 +2896,25 @@ void wakeup_kcompactd(pg_data_t *pgdat, int order, int highest_zoneidx)
        wake_up_interruptible(&pgdat->kcompactd_wait);
 }

+DEFINE_STATIC_KEY_TRUE(sh_true);
+DEFINE_STATIC_KEY_TRUE(sh_false);
+
+static noinline void check_compact_true(void)
+{
+       if (static_branch_likely(&sh_true)) {
+               pr_err("check_compact_true\n");
+       }
+
+}
+
+static noinline void check_compact_false(void)
+{
+       if (static_branch_unlikely(&sh_false)) {
+               pr_err("check_compact_false\n");
+       }
+
+}
+
 /*
  * The background compaction daemon, started as a kernel thread
  * from the init process.
@@ -2920,6 +2939,10 @@ static int kcompactd(void *p)
        while (!kthread_should_stop()) {
                unsigned long pflags;

+               static_key_enable(&sh_true.key);
+               static_key_disable(&sh_false.key);
+               check_compact_true();
+               check_compact_false();
                /*
```

crash 结果是
```
crash> ls
dump.202109261702  vmlinux
crash> dis check_compact_true
0xffffffff85e2ce00 <check_compact_true>:        xchg   %ax,%ax
0xffffffff85e2ce02 <check_compact_true+2>:      jmpq   0xffffffff86950654 <check_compact_true.cold>
0xffffffff85e2ce07 <check_compact_true+7>:      retq
0xffffffff85e2ce08 <check_compact_true+8>:      nopl   0x0(%rax,%rax,1)
crash> dis check_compact_false
0xffffffff85e2ce10 <check_compact_false>:       nopl   0x0(%rax,%rax,1) [FTRACE NOP]
0xffffffff85e2ce15 <check_compact_false+5>:     retq
0xffffffff85e2ce16 <check_compact_false+6>:     nopw   %cs:0x0(%rax,%rax,1)
crash> dis check_compact_true.cold
0xffffffff86950654 <check_compact_true.cold>:   mov    $0xffffffff871b19a4,%rdi
0xffffffff8695065b <check_compact_true.cold+7>: jmpq   0xffffffff8694ba28 <_printk>
crash>
```

可以看到：
+ `check_compact_true` 在被优化之后 只有一个 `jmp` 指令，没有任何类似于 test 的判断指令
+ `check_compact_false` 在被优化之后 只有一个 `nopl` 指令，没有任何类似于 test 的判断指令

这里需要加上 `noinline` 修饰符，否则编译器会自动 `inline`这个函数。


## 代码分析


暂时还没完全看懂，看 `demo2` 算是 了解基本原理实现。
后续补充。。









参考[内核基础设施——static_key](http://linux.laoqinren.net/kernel/static_key/)
参考[Linux Jump Label/static-key机制详解](https://rtoax.blog.csdn.net/article/details/115279591?utm_medium=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2%7Edefault%7ECTRLIST%7Edefault-1.no_search_link)
