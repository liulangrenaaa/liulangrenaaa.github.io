---
title: kprobes 原理与使用
date: 2021-01-29 19:00:00
tags:
    - kprobes
    - kretprobes
    - aarch64
    - BRK
categories:
    - kernel debug
slug: "内核观测/性能稳定性/kprobes-原理与使用"
---




## kprobe 原理

### 开启 CONFIG_FUNCTION_TRACER 时

在开启 `CONFIG_FUNCTION_TRACER` 情况下，
不开启 `kprobe` 的情况下，产生crash
```
crash> dis kmem_cache_alloc
0xffffffffbc089800 <kmem_cache_alloc>:  nopl   0x0(%rax,%rax,1) [FTRACE NOP]
0xffffffffbc089805 <kmem_cache_alloc+5>:        push   %r15
0xffffffffbc089807 <kmem_cache_alloc+7>:        push   %r14
0xffffffffbc089809 <kmem_cache_alloc+9>:        mov    %esi,%r14d
0xffffffffbc08980c <kmem_cache_alloc+12>:       push   %r13
0xffffffffbc08980e <kmem_cache_alloc+14>:       push   %r12
0xffffffffbc089810 <kmem_cache_alloc+16>:       mov    0x185c69d(%rip),%r12d        # 0xffffffffbd8e5eb4
0xffffffffbc089817 <kmem_cache_alloc+23>:       push   %rbp
0xffffffffbc089818 <kmem_cache_alloc+24>:       mov    %rdi,%rbp
0xffffffffbc08981b <kmem_cache_alloc+27>:       push   %rbx
0xffffffffbc08981c <kmem_cache_alloc+28>:       and    %esi,%r12d
0xffffffffbc08981f <kmem_cache_alloc+31>:       mov    0x1c(%rdi),%ebx
0xffffffffbc089822 <kmem_cache_alloc+34>:       mov    %r12d,%edi
0xffffffffbc089825 <kmem_cache_alloc+37>:       mov    0x30(%rsp),%r15
0xffffffffbc08982a <kmem_cache_alloc+42>:       callq  0xffffffffbc061b20 <fs_reclaim_acquire>
0xffffffffbc08982f <kmem_cache_alloc+47>:       mov    %r12d,%edi
0xffffffffbc089832 <kmem_cache_alloc+50>:       callq  0xffffffffbc061a50 <fs_reclaim_release>
0xffffffffbc089837 <kmem_cache_alloc+55>:       test   $0x400,%r12d
0xffffffffbc08983e <kmem_cache_alloc+62>:       jne    0xffffffffbc089c15 <kmem_cache_alloc+1045>
0xffffffffbc089844 <kmem_cache_alloc+68>:       mov    %r12d,%esi
0xffffffffbc089847 <kmem_cache_alloc+71>:       mov    %rbp,%rdi
crash>
```
可以看到 `kmem_cache_alloc+0` 位置的instruction是 `nopl`


在开启对 `kmem_cache_alloc` 的 kprobe之后，再出发一次 crash,然后看 函数反汇编

```
crash> dis kmem_cache_alloc
0xffffffff8329ac80 <kmem_cache_alloc>:  callq  0xffffffffc0227000
0xffffffff8329ac85 <kmem_cache_alloc+5>:        push   %r15
0xffffffff8329ac87 <kmem_cache_alloc+7>:        mov    %esi,%ecx
0xffffffff8329ac89 <kmem_cache_alloc+9>:        mov    $0x1,%edx
0xffffffff8329ac8e <kmem_cache_alloc+14>:       push   %r14
0xffffffff8329ac90 <kmem_cache_alloc+16>:       push   %r13
0xffffffff8329ac92 <kmem_cache_alloc+18>:       mov    %rdi,%r13
0xffffffff8329ac95 <kmem_cache_alloc+21>:       push   %r12
0xffffffff8329ac97 <kmem_cache_alloc+23>:       push   %rbp
0xffffffff8329ac98 <kmem_cache_alloc+24>:       push   %rbx
0xffffffff8329ac99 <kmem_cache_alloc+25>:       sub    $0x18,%rsp
0xffffffff8329ac9d <kmem_cache_alloc+29>:       mov    0x1c(%rdi),%ebx
0xffffffff8329aca0 <kmem_cache_alloc+32>:       mov    %esi,0x4(%rsp)
0xffffffff8329aca4 <kmem_cache_alloc+36>:       lea    0x8(%rsp),%rsi
0xffffffff8329aca9 <kmem_cache_alloc+41>:       mov    0x48(%rsp),%r15
0xffffffff8329acae <kmem_cache_alloc+46>:       mov    %gs:0x28,%rax
0xffffffff8329acb7 <kmem_cache_alloc+55>:       mov    %rax,0x10(%rsp)
0xffffffff8329acbc <kmem_cache_alloc+60>:       xor    %eax,%eax
0xffffffff8329acbe <kmem_cache_alloc+62>:       movq   $0x0,0x8(%rsp)
0xffffffff8329acc7 <kmem_cache_alloc+71>:       callq  0xffffffff83294dc0 <slab_pre_alloc_hook.constprop.0>
0xffffffff8329accc <kmem_cache_alloc+76>:       test   %rax,%rax
crash>
```

可以看到，此时`kmem_cache_alloc+0` 位置的instruction是 `callq  0xffffffffc0227000`，这是 `x86`平台 jmp优化之后的指令




### 关闭 CONFIG_FUNCTION_TRACER 时

不开启 `kprobe` 的情况下，产生crash
```
crash> dis kmem_cache_alloc
0xffffffffbb681430 <kmem_cache_alloc>:  push   %r15
0xffffffffbb681432 <kmem_cache_alloc+2>:        mov    %esi,%ecx
0xffffffffbb681434 <kmem_cache_alloc+4>:        mov    $0x1,%edx
0xffffffffbb681439 <kmem_cache_alloc+9>:        push   %r14
0xffffffffbb68143b <kmem_cache_alloc+11>:       push   %r13
0xffffffffbb68143d <kmem_cache_alloc+13>:       mov    %rdi,%r13
0xffffffffbb681440 <kmem_cache_alloc+16>:       push   %r12
0xffffffffbb681442 <kmem_cache_alloc+18>:       push   %rbp
0xffffffffbb681443 <kmem_cache_alloc+19>:       push   %rbx
0xffffffffbb681444 <kmem_cache_alloc+20>:       sub    $0x18,%rsp
0xffffffffbb681448 <kmem_cache_alloc+24>:       mov    0x1c(%rdi),%ebx
0xffffffffbb68144b <kmem_cache_alloc+27>:       mov    %esi,0x4(%rsp)
0xffffffffbb68144f <kmem_cache_alloc+31>:       lea    0x8(%rsp),%rsi
0xffffffffbb681454 <kmem_cache_alloc+36>:       mov    0x48(%rsp),%r15
0xffffffffbb681459 <kmem_cache_alloc+41>:       mov    %gs:0x28,%rax
0xffffffffbb681462 <kmem_cache_alloc+50>:       mov    %rax,0x10(%rsp)
0xffffffffbb681467 <kmem_cache_alloc+55>:       xor    %eax,%eax
0xffffffffbb681469 <kmem_cache_alloc+57>:       movq   $0x0,0x8(%rsp)
crash>
```



在开启对 `kmem_cache_alloc` 的 kprobe之后，再出发一次 crash,然后看 函数反汇编
```
crash> dis kmem_cache_alloc
0xffffffff83a81430 <kmem_cache_alloc>:  jmpq   0xffffffffc0608000
0xffffffff83a81435 <kmem_cache_alloc+5>:        add    %eax,(%rax)
0xffffffff83a81437 <kmem_cache_alloc+7>:        add    %al,(%rax)
0xffffffff83a81439 <kmem_cache_alloc+9>:        push   %r14
0xffffffff83a8143b <kmem_cache_alloc+11>:       push   %r13
0xffffffff83a8143d <kmem_cache_alloc+13>:       mov    %rdi,%r13
0xffffffff83a81440 <kmem_cache_alloc+16>:       push   %r12
0xffffffff83a81442 <kmem_cache_alloc+18>:       push   %rbp
0xffffffff83a81443 <kmem_cache_alloc+19>:       push   %rbx
0xffffffff83a81444 <kmem_cache_alloc+20>:       sub    $0x18,%rsp
0xffffffff83a81448 <kmem_cache_alloc+24>:       mov    0x1c(%rdi),%ebx
0xffffffff83a8144b <kmem_cache_alloc+27>:       mov    %esi,0x4(%rsp)
0xffffffff83a8144f <kmem_cache_alloc+31>:       lea    0x8(%rsp),%rsi
0xffffffff83a81454 <kmem_cache_alloc+36>:       mov    0x48(%rsp),%r15
0xffffffff83a81459 <kmem_cache_alloc+41>:       mov    %gs:0x28,%rax
0xffffffff83a81462 <kmem_cache_alloc+50>:       mov    %rax,0x10(%rsp)
0xffffffff83a81467 <kmem_cache_alloc+55>:       xor    %eax,%eax
0xffffffff83a81469 <kmem_cache_alloc+57>:       movq   $0x0,0x8(%rsp)
crash>
```

可以看到，此时`kmem_cache_alloc+0` 位置的instruction是 `callq  0xffffffffc0227000`，这是 `x86`平台 jmp优化之后的指令

## 代码分析
### debugfs 创建
```
static int __init debugfs_kprobe_init(void)
{
	struct dentry *dir;
	unsigned int value = 1;

	dir = debugfs_create_dir("kprobes", NULL);

	debugfs_create_file("list", 0400, dir, NULL, &kprobes_fops);

	debugfs_create_file("enabled", 0600, dir, &value, &fops_kp);

	debugfs_create_file("blacklist", 0400, dir, NULL,
			    &kprobe_blacklist_fops);

	return 0;
}
```

会在 `/sys/kernel/debug/kprobes` 创建几个文件
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug/kprobes# ls
blacklist  enabled  list
```

### register_kprobe

```
int register_kprobe(struct kprobe *p)
{

	p->flags &= KPROBE_FLAG_DISABLED;
	p->nmissed = 0;
	INIT_LIST_HEAD(&p->list);

	old_p = get_kprobe(p->addr);
	if (old_p) { // 如果这个 addr 已经注册了 kprobe 了。
		/* Since this may unoptimize old_p, locking text_mutex. */
		ret = register_aggr_kprobe(old_p, p);
		goto out;
	}

	cpus_read_lock();
	/* Prevent text modification */
	mutex_lock(&text_mutex);
	ret = prepare_kprobe(p);  // 将 addr 地址处的指令 copy到 opcode，当做备份
	mutex_unlock(&text_mutex);
	cpus_read_unlock();

	INIT_HLIST_NODE(&p->hlist); // 将此 kprobe 添加到 kprobe_table 中
	hlist_add_head_rcu(&p->hlist,
		       &kprobe_table[hash_ptr(p->addr, KPROBE_HASH_BITS)]);

  // 如果系统已经将 所有 kprobe arm了，此时也需要顺便将此 kprobe arm
	if (!kprobes_all_disarmed && !kprobe_disabled(p)) {
		ret = arm_kprobe(p);
	}
}
```

`get_kprobe` 可以通过地址`addr`，在 hlist `kprobe_table` 中确定 这个地址是否已经注册了 kprobe，如果已经注册，就需要 `register_aggr_kprobe` 注册 aggr 的kprobe。
```
struct kprobe *get_kprobe(void *addr)
{
	struct hlist_head *head;
	struct kprobe *p;

	head = &kprobe_table[hash_ptr(addr, KPROBE_HASH_BITS)];
	hlist_for_each_entry_rcu(p, head, hlist,
				 lockdep_is_held(&kprobe_mutex)) {
		if (p->addr == addr)
			return p;
	}
	return NULL;
}
```

`prepare_kprobe` 会将 p 处指令 copy到 opcode 中，作为备份。
```
static void __kprobes arch_prepare_ss_slot(struct kprobe *p)
{
	/* prepare insn slot */
	aarch64_insn_patch_text(addrs, insns, 2); // 替换指令

	flush_icache_range((uintptr_t)addr, (uintptr_t)(addr + MAX_INSN_SIZE)); // 因为指令发生了改变，所以需要flush icahe

	/*
	 * Needs restoring of return address after stepping xol.
	 */
	p->ainsn.api.restore = (unsigned long) p->addr +
	  sizeof(kprobe_opcode_t);
}


int __kprobes arch_prepare_kprobe(struct kprobe *p)
{
	unsigned long probe_addr = (unsigned long)p->addr;
	enum probe_insn insn;

	/* copy instruction */
	p->opcode = le32_to_cpu(*p->addr); // 复制 kprobe 地址处的指令到 opcode中

	/* decode instruction */
	insn = arm_kprobe_decode_insn(p->addr, &p->ainsn); // 解码 被替换的指令
	pr_err("arch_prepare_kprobe 0x%p, insn: %d\n", p->addr, insn);

	switch (insn) {
	case INSN_REJECTED:	/* insn not supported */
		return -EINVAL;

	case INSN_GOOD_NO_SLOT:	/* insn need simulation */
		p->ainsn.api.insn = NULL;
		break;

	case INSN_GOOD:	/* instruction uses slot */ // 通过添加log，确定aarch64 中 nop 指令都是 INSN_GOOD 类型
		p->ainsn.api.insn = get_insn_slot();
		if (!p->ainsn.api.insn)
			return -ENOMEM;
		break;
	}

	/* prepare the instruction */
	if (p->ainsn.api.insn)
		arch_prepare_ss_slot(p); // 替换掉 需要 probe的指令
	else
		arch_prepare_simulate(p);

	return 0;
}

static inline int prepare_kprobe(struct kprobe *p)
{
	return arch_prepare_kprobe(p);
}
```

`objdump -d -l ./out/vmlinux` 信息：
```
ffff800010294e70 <kmem_cache_alloc>:
kmem_cache_alloc():
/home/ubuntu/workspace/arm64_linux/out/../mm/slub.c:5432
ffff800010294e70:       d503201f        nop
ffff800010294e74:       d503201f        nop
/home/ubuntu/workspace/arm64_linux/out/../mm/slub.c:3218
ffff800010294e78:       d503233f        paciasp
ffff800010294e7c:       a9b87bfd        stp     x29, x30, [sp, #-128]!
ffff800010294e80:       910003fd        mov     x29, sp
ffff800010294e84:       a90363f7        stp     x23, x24, [sp, #48]
/home/ubuntu/workspace/arm64_linux/out/../mm/slub.c:3219
ffff800010294e88:       d00117f8        adrp    x24, ffff800012592000 <__boot_cpu_mode>
ffff800010294e8c:       aa1e03f7        mov     x23, x30
ffff800010294e90:       d50320ff        xpaclri
/home/ubuntu/workspace/arm64_linux/out/../mm/slub.c:3218
ffff800010294e94:       a90153f3        stp     x19, x20, [sp, #16]
ffff800010294e98:       aa0003f3        mov     x19, x0
```

这是添加的 log 输出
```
[  167.726444] register_kprobe 0x000000005af64ff2
[  167.726913] aarch64_insn_is_steppable 05
[  167.727012] aarch64_insn_is_steppable INSN_GOOD
```

### register_kprobe 中保存的指令
```
static void __kprobes arch_prepare_ss_slot(struct kprobe *p)
{
	kprobe_opcode_t *addr = p->ainsn.api.insn;
	void *addrs[] = {addr, addr + 1};
	u32 insns[] = {p->opcode, BRK64_OPCODE_KPROBES_SS}; // 在 slot 地址填充 opcode 地址 和 BRK64_OPCODE_KPROBES_SS 单步指令

	/* prepare insn slot */
	aarch64_insn_patch_text(addrs, insns, 2);

	flush_icache_range((uintptr_t)addr, (uintptr_t)(addr + MAX_INSN_SIZE));

	/*
	 * Needs restoring of return address after stepping xol.
	 */
	p->ainsn.api.restore = (unsigned long) p->addr +
	  sizeof(kprobe_opcode_t);
}
```
在 slot 地址填充 刚刚保存的`opcode` 和 自定义的`BRK64_OPCODE_KPROBES_SS` 单步指令

aarch64 使用 BRK 指令来 实现 kprobe, brk的 指令码是 `AARCH64_BREAK_MON	0xd4200000`
```
/*
 * #imm16 values used for BRK instruction generation
 * 0x004: for installing kprobes
 * 0x005: for installing uprobes
 * 0x006: for kprobe software single-step
 * Allowed values for kgdb are 0x400 - 0x7ff
 * 0x100: for triggering a fault on purpose (reserved)
 * 0x400: for dynamic BRK instruction
 * 0x401: for compile time BRK instruction
 * 0x800: kernel-mode BUG() and WARN() traps
 * 0x9xx: tag-based KASAN trap (allowed values 0x900 - 0x9ff)
 */
#define KPROBES_BRK_IMM			0x004
#define UPROBES_BRK_IMM			0x005
#define KPROBES_BRK_SS_IMM		0x006
#define FAULT_BRK_IMM			0x100
#define KGDB_DYN_DBG_BRK_IMM		0x400
#define KGDB_COMPILED_DBG_BRK_IMM	0x401
#define BUG_BRK_IMM			0x800
#define KASAN_BRK_IMM			0x900
#define KASAN_BRK_MASK			0x0ff


/*
 * BRK instruction encoding
 * The #imm16 value should be placed at bits[20:5] within BRK ins
 */
#define AARCH64_BREAK_MON	0xd4200000


/* kprobes BRK opcodes with ESR encoding  */
#define BRK64_OPCODE_KPROBES	(AARCH64_BREAK_MON | (KPROBES_BRK_IMM << 5))
#define BRK64_OPCODE_KPROBES_SS	(AARCH64_BREAK_MON | (KPROBES_BRK_SS_IMM << 5))
```


### enable_kprobe
`kprobe` 在 register 之后，只是在 某个地址处保存了两条指令而已：
+ opcode： 保存的是被 probe 地址处的 指令
+ KPROBES_BRK_SS_IMM：kprobe 单步指令
kprobe 真正的work,还需要将它使能
```
/* arm kprobe: install breakpoint in text */
void __kprobes arch_arm_kprobe(struct kprobe *p)
{
	void *addr = p->addr;
	u32 insn = BRK64_OPCODE_KPROBES;

	aarch64_insn_patch_text(&addr, &insn, 1); // 将 被probe地址处的指令 替换成 BRK64_OPCODE_KPROBES
}

#define __arm_kprobe(p)				arch_arm_kprobe(p)

/* Arm a kprobe with text_mutex */
static int arm_kprobe(struct kprobe *kp)
{
	__arm_kprobe(kp);
}

/* Enable one kprobe */
int enable_kprobe(struct kprobe *kp)
{
	int ret = 0;
	struct kprobe *p;

	mutex_lock(&kprobe_mutex);
	if (!kprobes_all_disarmed && kprobe_disabled(p)) {
		p->flags &= ~KPROBE_FLAG_DISABLED;
		ret = arm_kprobe(p);
	}
	mutex_unlock(&kprobe_mutex);
	return ret;
}
```

可以看到 真正的使能只是将 被probe地址处的指令 替换成 `BRK64_OPCODE_KPROBES`
所以一个地址被 kprobe 之后，这个地址附近指令执行顺序是：
```
BRK64_OPCODE_KPROBES --> opcode -> BRK64_OPCODE_KPROBES_SS
```

### kprobe 的执行
上面讲到 kprobe 的执行顺序：
主要和 `struct break_hook` 有关：
```
static struct break_hook kprobes_break_ss_hook = {
	.imm = KPROBES_BRK_SS_IMM,
	.fn = kprobe_breakpoint_ss_handler,
};

static struct break_hook kprobes_break_hook = {
	.imm = KPROBES_BRK_IMM,
	.fn = kprobe_breakpoint_handler,
};
```

在遇到 `BRK` 指令时
```
static int call_break_hook(struct pt_regs *regs, unsigned int esr)
{
	list_for_each_entry_rcu(hook, list, node) {
		unsigned int comment = esr & ESR_ELx_BRK64_ISS_COMMENT_MASK;

		if ((comment & ~hook->mask) == hook->imm)
			fn = hook->fn;
	}

	return fn ? fn(regs, esr) : DBG_HOOK_ERROR;
}

static int brk_handler(unsigned long unused, unsigned int esr,
		       struct pt_regs *regs)
{
	if (call_break_hook(regs, esr) == DBG_HOOK_HANDLED)
		return 0;
}
```


`handler` 初始化
```
void __init debug_traps_init(void)
{
	hook_debug_fault_code(DBG_ESR_EVT_BRK, brk_handler, SIGTRAP,
			      TRAP_BRKPT, "BRK handler");
}
```

可以看出 在执行 `BRK64_OPCODE_KPROBES` 时，`(comment & ~hook->mask) == KPROBES_BRK_IMM`, 执行的函数是 `kprobe_breakpoint_handler`。

可以看出 在执行 `BRK64_OPCODE_KPROBES_SS` 时，`(comment & ~hook->mask) == KPROBES_BRK_SS_IMM`, 执行的函数是 `kprobe_breakpoint_ss_handler`。


其中 `kprobe_breakpoint_handler`, 里面会执行 `->pre_handler()`
```
static void __kprobes kprobe_handler(struct pt_regs *regs)
{
	struct kprobe *p, *cur_kprobe;
	struct kprobe_ctlblk *kcb;
	unsigned long addr = instruction_pointer(regs);

	kcb = get_kprobe_ctlblk();
	cur_kprobe = kprobe_running();

	p = get_kprobe((kprobe_opcode_t *) addr);

	if (p) {
		if (cur_kprobe) {
			if (reenter_kprobe(p, regs, kcb))
				return;
		} else {
			/* Probe hit */
			set_current_kprobe(p);
			kcb->kprobe_status = KPROBE_HIT_ACTIVE;

			if (!p->pre_handler || !p->pre_handler(p, regs)) {
				setup_singlestep(p, regs, kcb, 0);
			} else
				reset_current_kprobe();
		}
	}
}

static int __kprobes
kprobe_breakpoint_handler(struct pt_regs *regs, unsigned int esr)
{
	kprobe_handler(regs);
	return DBG_HOOK_HANDLED;
}
```

其中 `kprobe_breakpoint_ss_handler`, 里面会执行 `->post_handler()`
```
static void __kprobes
post_kprobe_handler(struct kprobe *cur, struct kprobe_ctlblk *kcb, struct pt_regs *regs)
{
	/* return addr restore if non-branching insn */
	if (cur->ainsn.api.restore != 0)
		instruction_pointer_set(regs, cur->ainsn.api.restore);

	/* restore back original saved kprobe variables and continue */
	if (kcb->kprobe_status == KPROBE_REENTER) {
		restore_previous_kprobe(kcb);
		return;
	}
	/* call post handler */
	kcb->kprobe_status = KPROBE_HIT_SSDONE;
	if (cur->post_handler)
		cur->post_handler(cur, regs, 0);

	reset_current_kprobe();
}

static int __kprobes
kprobe_breakpoint_ss_handler(struct pt_regs *regs, unsigned int esr)
{
	struct kprobe_ctlblk *kcb = get_kprobe_ctlblk();
	unsigned long addr = instruction_pointer(regs);
	struct kprobe *cur = kprobe_running();

	if (cur && (kcb->kprobe_status & (KPROBE_HIT_SS | KPROBE_REENTER)) &&
	    ((unsigned long)&cur->ainsn.api.insn[1] == addr)) {
		kprobes_restore_local_irqflag(kcb, regs);
		post_kprobe_handler(cur, kcb, regs);

		return DBG_HOOK_HANDLED;
	}

	/* not ours, kprobes should ignore it */
	return DBG_HOOK_ERROR;
}
```

到这里 aarch64 的 kprobe 执行过程就已经分析完成了，可以看到 kprobe 可以对内核任何地址进行 probe(除了blacklist)，并不需要 CONFIG_FUNCTION_TRACE，将函数第一个地址 编译成为 NOP。

### disable_kprobe
与 `enable_kprobe` 对应的是，`disable_kprobe` 只是将 将`p->addr`地址处的 `BRK64_OPCODE_KPROBES` 指令替换为 原来的 `p->opcode`
```
void __kprobes arch_disarm_kprobe(struct kprobe *p)
{
	void *addr = p->addr;

	aarch64_insn_patch_text(&addr, &p->opcode, 1);  // 将 被probe地址处的指令替换为 opcode
}

#define __disarm_kprobe(p, o)			arch_disarm_kprobe(p)


/* Disarm a kprobe with text_mutex */
static int disarm_kprobe(struct kprobe *kp, bool reopt)
{
	cpus_read_lock();
	mutex_lock(&text_mutex);
	__disarm_kprobe(kp, reopt);
	mutex_unlock(&text_mutex);
	cpus_read_unlock();
	return 0;
}


/* Disable one kprobe: Make sure called under kprobe_mutex is locked */
static struct kprobe *__disable_kprobe(struct kprobe *p)
{
	if (!kprobe_disabled(p)) {
		/* Disable probe if it is a child probe */
		if (p != orig_p)
			p->flags |= KPROBE_FLAG_DISABLED;

		/* Try to disarm and disable this/parent probe */
		if (p == orig_p || aggr_kprobe_disabled(orig_p)) {
			if (!kprobes_all_disarmed) {
				ret = disarm_kprobe(orig_p, true);
			}
			orig_p->flags |= KPROBE_FLAG_DISABLED;
		}
	}

	return orig_p;
}

/* Disable one kprobe */
int disable_kprobe(struct kprobe *kp)
{
	mutex_lock(&kprobe_mutex);
	/* Disable this kprobe */
	p = __disable_kprobe(kp);

	mutex_unlock(&kprobe_mutex);
	return ret;
}
EXPORT_SYMBOL_GPL(disable_kprobe);
```


### unregister_kprobe
与 `register_kprobe` 不同的是，只需要 free slot内存就可以了。
```
void unregister_kprobe(struct kprobe *p)
{
	unregister_kprobes(&p, 1);
}
```




## kprobes使用
最基本的方式就是写一个 kpobes 相关的 module，编译安装到 kernel里面，实现想要的功能，但是由于以下原因，一般使用中不常用 `module`的方式：
1. kernel module 对于仅仅想使用的人来说难度较大
2. kernel module 有问题的话直接会导致 panic等严重问题
3. kernel module 编译安装，相比与其他方式资源消耗较大

除了直接使用 `kernel module` 的方式外，还可以使用 `ftrace 框架`，`perf`，`bpftrace`等集成好的工具框架。


### 通过kernel module 使用
参考写的[test case](https://github.com/liulangrenaaa/test_modules/blob/main/trace/kprobes/kprobe_trace.c)
后面发现 kernel 的samples也实现了这个[example](https://github.com/torvalds/linux/tree/master/samples/kprobes)。。
编译安装之后，随便运行一些命令，`dmesg`看
```
[  282.874169] Planted kprobe at 00000000ef62436b
[  282.899730] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  282.899732] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  288.039369] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  288.039373] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  289.401793] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  289.401794] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  294.421145] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  294.421148] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  294.428760] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  294.428764] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  297.028993] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  297.028998] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[  299.595467] <kernel_clone> pre_handler: p->addr = 00000000ef62436b, ip = ffffffffafe69fa1, flags = 0x206
[  299.595471] <kernel_clone> post_handler: p->addr = 00000000ef62436b, flags = 0x206
[ 1137.315517] kprobe at 00000000ef62436b unregistered
```

可以看到每次运行到 `kernel_fork` 位置，都会触发 `pre_handler`，结束也会触发`post_handler`。


### 与 trace 框架结合使用
`trace` 框架中，与 `kprobe`相关的节点有如下节点
```
/sys/kernel/debug/tracing/kprobe_events-----------------------配置kprobe事件属性，增加事件之后会在kprobes下面生成对应目录。
/sys/kernel/debug/tracing/kprobe_profile----------------------kprobe事件统计属性文件。
/sys/kernel/debug/tracing/kprobes/<GRP>/<EVENT>/enabled-------使能kprobe事件
/sys/kernel/debug/tracing/kprobes/<GRP>/<EVENT>/filter--------过滤kprobe事件
/sys/kernel/debug/tracing/kprobes/<GRP>/<EVENT>/format--------查询kprobe事件显示格式
```

可以通过如下方式配置 `kprobe`
```
p[:[GRP/]EVENT] [MOD:]SYM[+offs]|MEMADDR [FETCHARGS]-------------------设置一个probe探测点
r[:[GRP/]EVENT] [MOD:]SYM[+0] [FETCHARGS]------------------------------设置一个return probe探测点
-:[GRP/]EVENT----------------------------------------------------------删除一个探测点
```




examples:

添加
```
echo 'p:myprobe do_sys_open dfd=%ax filename=%dx flags=%cx mode=+4($stack)' > /sys/kernel/debug/tracing/kprobe_events
echo 'r:myretprobe do_sys_open ret=$retval' >> /sys/kernel/debug/tracing/kprobe_events
```

开始
```
echo 1 > /sys/kernel/debug/tracing/events/kprobes/myprobe/enable
echo 1 > /sys/kernel/debug/tracing/events/kprobes/myretprobe/enable
```

结果
```
root@rlk-Standard-PC-i440FX-PIIX-1996:/sys/kernel/debug/tracing# cat /sys/kernel/debug/tracing/trace
# tracer: nop
#
# entries-in-buffer/entries-written: 103/103   #P:4
#
#                                _-----=> irqs-off
#                               / _----=> need-resched
#                              | / _---=> hardirq/softirq
#                              || / _--=> preempt-depth
#                              ||| /     delay
#           TASK-PID     CPU#  ||||   TIMESTAMP  FUNCTION
#              | |         |   ||||      |         |
      irqbalance-344     [003] ...1  6185.081692: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x8000 flags=0x0 mode=0xff
      irqbalance-344     [003] ...1  6185.082130: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x8000 flags=0x0 mode=0xff
            bash-3542    [001] ...1  6186.142775: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x8241 flags=0x1b6 mode=0f
            bash-3542    [001] ...1  6188.258576: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x98800 flags=0x0 mode=0xf
            bash-3542    [001] ...1  6188.258652: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
             cat-5421    [000] ...1  6188.662021: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x88000 flags=0x0 mode=0xf
             cat-5421    [000] ...1  6188.662087: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
             cat-5421    [000] ...1  6188.662117: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x88000 flags=0x0 mode=0xf
             cat-5421    [000] ...1  6188.662145: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
             cat-5421    [000] ...1  6188.662866: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x88000 flags=0x0 mode=0xf
             cat-5421    [000] ...1  6188.662910: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
             cat-5421    [000] ...1  6188.663082: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x8000 flags=0x0 mode=0xff
             cat-5421    [000] ...1  6188.663108: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
              ls-5422    [000] ...1  6192.453887: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x88000 flags=0x0 mode=0xf
              ls-5422    [000] ...1  6192.453928: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
              ls-5422    [000] ...1  6192.453951: myprobe: (do_sys_open+0x0/0x80) dfd=0xffffffffb0069510 filename=0x88000 flags=0x0 mode=0xf
              ls-5422    [000] ...1  6192.453972: myretprobe: (do_syscall_64+0x33/0x40 <- do_sys_open) ret=0x3
```


关闭
```
echo 0 > /sys/kernel/debug/tracing/events/kprobes/myprobe/enable
echo 0 > /sys/kernel/debug/tracing/events/kprobes/myretprobe/enable
```


删除
```
echo '-:myprobe' >> /sys/kernel/debug/tracing/kprobe_events
echo '-:myretprobe' >> /sys/kernel/debug/tracing/kprobe_events
```

这个方式和 `kernel module` 的操作方法流程一样，也需要手动添加，开启，最后关闭
整个流程最好写到`bash` 脚本中去执行比较好，但也比较麻烦

其实还可以在`enable`之前设置过滤选项
```
echo 'filename==0x8241' > /sys/kernel/debug/tracing/events/kprobes/myprobe/filter
```

### 与 perf 结合使用

```
root@ubuntu-Inspiron-5548:~# perf probe --add do_sys_open
Added new event:
  probe:do_sys_open    (on do_sys_open)

You can now use it in all perf tools, such as:

	perf record -e probe:do_sys_open -aR sleep 1

root@ubuntu-Inspiron-5548:~# perf record -e probe:do_sys_open -aR sleep 5
[ perf record: Woken up 1 times to write data ]
[ perf record: Captured and wrote 1.377 MB perf.data (21 samples) ]
root@ubuntu-Inspiron-5548:~# perf script
            perf 75934 [003] 281578.918936: probe:do_sys_open: (ffffffff8a4fe540)
           sleep 75937 [000] 281578.919380: probe:do_sys_open: (ffffffff8a4fe540)
           sleep 75937 [000] 281578.919399: probe:do_sys_open: (ffffffff8a4fe540)
           sleep 75937 [000] 281578.919659: probe:do_sys_open: (ffffffff8a4fe540)
          chrome 44220 [003] 281581.327113: probe:do_sys_open: (ffffffff8a4fe540)
        thermald   815 [000] 281582.138797: probe:do_sys_open: (ffffffff8a4fe540)
        thermald   815 [000] 281582.138888: probe:do_sys_open: (ffffffff8a4fe540)
        thermald   815 [000] 281582.138926: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.566773: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567130: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567239: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567274: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567300: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567324: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567348: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567372: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567395: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567418: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567442: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567465: probe:do_sys_open: (ffffffff8a4fe540)
      irqbalance   704 [000] 281583.567488: probe:do_sys_open: (ffffffff8a4fe540)
root@ubuntu-Inspiron-5548:~# perf probe -d do_sys_open
Removed event: probe:do_sys_open
root@ubuntu-Inspiron-5548:~#
```

虽然不必要像 trace框架那样在各个目录间来回`echo` `cat`了，但是也还是需要手动去操作 `add`， `record`，`script`，`d` 的

perf 设置过滤选项 `--filter`



### 与 bpftrace 结合使用

bpftrace 可以一行做到以上很多行才能做到的事情，且异常退出也不需要手动清楚 `kprobe` 点。
```
root@ubuntu-Inspiron-5548:~# bpftrace -e 'kprobe:do_sys_open {printf("[%s]: do_sys_open\n", comm)}'
Attaching 1 probe...
[chrome]: do_sys_open
[thermald]: do_sys_open
[thermald]: do_sys_open
[thermald]: do_sys_open
^C
```

更关键的是，他的参数管理更加方便
```
root@ubuntu-Inspiron-5548:~# bpftrace -e 'kprobe:do_sys_open {printf("[pid-%d:%s]: do_sys_open %s\n", pid,comm, str(arg1))}'
Attaching 1 probe...
[pid-42080:gsd-housekeepin]: do_sys_open /etc/fstab
[pid-42080:gsd-housekeepin]: do_sys_open /proc/self/mountinfo
[pid-42080:gsd-housekeepin]: do_sys_open /run/mount/utab
[pid-42080:gsd-housekeepin]: do_sys_open /proc/self/mountinfo
[pid-42080:gsd-housekeepin]: do_sys_open /run/mount/utab
^C
```

bpftrace 可以通过 / xxx / 来设置过滤选项。





































参考[Linux kprobe调试技术使用](https://www.cnblogs.com/arnoldlu/p/9752061.html)