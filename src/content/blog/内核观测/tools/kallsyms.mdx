---
title: kallsyms
date: 2021-01-7 20:00:40
tags:
    - kallsyms
categories:
    - linux内核
slug: "内核观测/tools/kallsyms"
---



## 介绍
`kallsyms` 是内核的一个机制，和内核符号表有关，和他有关的宏是
```
ubuntu@zeku_server:~/workspace/linux $ cat ./out/.config | grep CONFIG_KALLSYMS
CONFIG_KALLSYMS=y
CONFIG_KALLSYMS_ALL=y
CONFIG_KALLSYMS_ABSOLUTE_PERCPU=y
CONFIG_KALLSYMS_BASE_RELATIVE=y
ubuntu@zeku_server:~/workspace/linux $
```

在 `scripts/link-vmlinux.sh` 脚本中加入 下面的patch, 重新编译内核
```
diff --git a/scripts/link-vmlinux.sh b/scripts/link-vmlinux.sh
index d74cee5c4326..c85541cbdd9d 100755
--- a/scripts/link-vmlinux.sh
+++ b/scripts/link-vmlinux.sh
@@ -309,6 +309,14 @@ cleanup()
        rm -f .vmlinux.d
 }

+echo "link-vmlinux.sh starting ......"
+echo "xxxxx \$KBUILD_VERBOSE = "$KBUILD_VERBOSE
+echo "xxxxx \$1              = "$1
+echo "xxxxx \$2              = "$2
+echo "xxxxx \$3              = "$3
+echo "xxxxx \${MAKE}         = "${MAKE}
+
+# echo "xxxxx \$4          = "$4
 # Use "make V=1" to debug this script
 case "${KBUILD_VERBOSE}" in
 *1*)
@@ -338,8 +346,11 @@ fi;
 ${MAKE} -f "${srctree}/scripts/Makefile.build" obj=init need-builtin=1

 #link vmlinux.o
+echo "xxxxx modpost_link start......"
 modpost_link vmlinux.o
+echo "xxxxx objtool_link start...... "
 objtool_link vmlinux.o
+echo "xxxxx objtool_link end......"

 # modpost vmlinux.o to check for section mismatches
 ${MAKE} -f "${srctree}/scripts/Makefile.modpost" MODPOST_VMLINUX=1
 @@ -369,14 +380,14 @@ if [ -n "${CONFIG_KALLSYMS}" ]; then
        # kallsyms support
        # Generate section listing all symbols and add it into vmlinux
        # It's a three step process:
-       # 1)  Link .tmp_vmlinux1 so it has all symbols and sections,
+       # 1)  Link .tmp_vmlinux.kallsyms1 so it has all symbols and sections,
        #     but __kallsyms is empty.
        #     Running kallsyms on that gives us .tmp_kallsyms1.o with
        #     the right size
-       # 2)  Link .tmp_vmlinux2 so it now has a __kallsyms section of
+       # 2)  Link .tmp_vmlinux.kallsyms2 so it now has a __kallsyms section of
        #     the right size, but due to the added section, some
        #     addresses have shifted.
-       #     From here, we generate a correct .tmp_kallsyms2.o
+       #     From here, we generate a correct .tmp_vmlinux.kallsyms2.o
        # 3)  That link may have expanded the kernel image enough that
        #     more linker branch stubs / trampolines had to be added, which
        #     introduces new names, which further expands kallsyms. Do another
@@ -389,7 +400,9 @@ if [ -n "${CONFIG_KALLSYMS}" ]; then
        # a)  Verify that the System.map from vmlinux matches the map from
        #     ${kallsymso}.

+       echo "xxxxx kallsyms_step 1......"
        kallsyms_step 1
+       echo "xxxxx kallsyms_step 2......"
        kallsyms_step 2

        # step 3
@@ -433,3 +446,5 @@ fi

 # For fixdep
 echo "vmlinux: $0" > .vmlinux.d
+
+echo "link-vmlinux.sh ending ......"
```

在编译阶段可以看到：
```
make[1]: 进入目录“/home/ubuntu/workspace/linux/out”
  GEN     Makefile
  DESCEND objtool
  CALL    ../scripts/atomic/check-atomics.sh
  CALL    ../scripts/checksyscalls.sh
  CHK     include/generated/compile.h
link-vmlinux.sh starting ......
xxxxx $KBUILD_VERBOSE = 0
xxxxx $1              = ld
xxxxx $2              = -m elf_x86_64
xxxxx $3              = --emit-relocs --discard-none -z max-page-size=0x200000 --build-id=sha1 --orphan-handling=warn
xxxxx ${MAKE}         = make
  GEN     .version
  CHK     include/generated/compile.h
  UPD     include/generated/compile.h
  CC      init/version.o
  AR      init/built-in.a
xxxxx modpost_link start......
  LD      vmlinux.o
xxxxx objtool_link start......
xxxxx objtool_link end......
  MODPOST vmlinux.symvers
  MODINFO modules.builtin.modinfo
  GEN     modules.builtin
xxxxx kallsyms_step 1......
  LD      .tmp_vmlinux.kallsyms1
  KSYMS   .tmp_vmlinux.kallsyms1.S
  AS      .tmp_vmlinux.kallsyms1.S
xxxxx kallsyms_step 2......
  LD      .tmp_vmlinux.kallsyms2
  KSYMS   .tmp_vmlinux.kallsyms2.S
  AS      .tmp_vmlinux.kallsyms2.S
  LD      vmlinux
  SORTTAB vmlinux
  SYSMAP  System.map
link-vmlinux.sh ending ......
  CC      arch/x86/boot/version.o
  VOFFSET arch/x86/boot/compressed/../voffset.h
  OBJCOPY arch/x86/boot/compressed/vmlinux.bin
  RELOCS  arch/x86/boot/compressed/vmlinux.relocs
  CC      arch/x86/boot/compressed/kaslr.o
  CC      arch/x86/boot/compressed/misc.o
  GZIP    arch/x86/boot/compressed/vmlinux.bin.gz
  MKPIGGY arch/x86/boot/compressed/piggy.S
  AS      arch/x86/boot/compressed/piggy.o
  LD      arch/x86/boot/compressed/vmlinux
  ZOFFSET arch/x86/boot/zoffset.h
  OBJCOPY arch/x86/boot/vmlinux.bin
  AS      arch/x86/boot/header.o
  LD      arch/x86/boot/setup.elf
  OBJCOPY arch/x86/boot/setup.bin
  BUILD   arch/x86/boot/bzImage
Kernel: arch/x86/boot/bzImage is ready  (#136)
```



## 代码分析

### link_vmlinux.sh 脚本分析




















### System.map 生成解析

link-vmlinux.sh 中可以看到 `System.map` 生成过程：
```
# Create map file with all symbols from ${1}
# See mksymap for additional details
mksysmap()
{
	${CONFIG_SHELL} "${srctree}/scripts/mksysmap" ${1} ${2}
}

......

info SYSMAP System.map
mksysmap vmlinux System.map
```

主要是用 `scripts/mksysmap vmlinux System.map` 命令生成的

`scripts/mksysmap` 脚本内容：
```
#!/bin/sh -x
# Based on the vmlinux file create the System.map file
# System.map is used by module-init tools and some debugging
# tools to retrieve the actual addresses of symbols in the kernel.
#
# Usage
# mksysmap vmlinux System.map


#####
# Generate System.map (actual filename passed as second argument)

# $NM produces the following output:
# f0081e80 T alloc_vfsmnt

#   The second row specify the type of the symbol:
#   A = Absolute
#   B = Uninitialised data (.bss)
#   C = Common symbol
#   D = Initialised data
#   G = Initialised data for small objects
#   I = Indirect reference to another symbol
#   N = Debugging symbol
#   R = Read only
#   S = Uninitialised data for small objects
#   T = Text code symbol
#   U = Undefined symbol
#   V = Weak symbol
#   W = Weak symbol
#   Corresponding small letters are local symbols

# For System.map filter away:
#   a - local absolute symbols
#   U - undefined global symbols
#   N - debugging symbols
#   w - local weak symbols

# readprofile starts reading symbols when _stext is found, and
# continue until it finds a symbol which is not either of 'T', 't',
# 'W' or 'w'. __crc_ are 'A' and placed in the middle
# so we just ignore them to let readprofile continue to work.
# (At least sparc64 has __crc_ in the middle).
# NM=gcc-nm
$NM -n $1 | grep -v '\( [aNUw] \)\|\(__crc_\)\|\( \$[adt]\)\|\( \.L\)' > $2
```

实际最后生成 `System.map` 的命令是：
```
gcc-nm -n vmlinux | grep -v '\( [aNUw] \)\|\(__crc_\)\|\( \$[adt]\)\|\( \.L\)' > System.map
```










### kernel/kallsyms.c 模块分析













