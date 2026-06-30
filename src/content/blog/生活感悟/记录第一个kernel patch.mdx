---
title: 记录第一个kernel patch
date: 2020-09-22 23:00:00
tags:
    - 生活感悟
    - kernel patch
categories:
    - 生活感悟
slug: "生活感悟/记录第一个kernel-patch"
---


之前也提过两个patch给社区不过都被否了，很多大佬第一次提patch也是从改改标点开始的。
最近在看文件系统相关的代码，看到有个地方定义和注释不一致，可以给社区贡献一下，也顺便记录一下，搭建环境的过程（之前用的ubuntu18虚拟机被我删了...现在用ubuntu20重新搞一下）

## 修改代码，形成patch
其实我这个patch很简单，只是修改一个注释而已：

```
sh@ubuntu:~/workspace/linux$ git diff
diff --git a/include/linux/jbd2.h b/include/linux/jbd2.h
index 08f904943ab2..a1ef05412acf 100644
--- a/include/linux/jbd2.h
+++ b/include/linux/jbd2.h
@@ -452,8 +452,8 @@ struct jbd2_inode {
 struct jbd2_revoke_table_s;

 /**
- * struct handle_s - The handle_s type is the concrete type associated with
- *     handle_t.
+ * struct jbd2_journal_handle - The jbd2_journal_handle type is the concrete
+ *     type associated with handle_t.
  * @h_transaction: Which compound transaction is this update a part of?
  * @h_journal: Which journal handle belongs to - used iff h_reserved set.
  * @h_rsv_handle: Handle reserved for finishing the logical operation.
sh@ubuntu:~/workspace/linux$
```

```
sh@ubuntu:~/workspace/linux$ git log -1
commit f8db1794205285c44d4b0b7d83f0fda1b9adec00 (HEAD -> master)
Author: Hui Su <sh_def@163.com>
Date:   Tue Sep 22 23:28:05 2020 +0800

    FIX the comment of struct jbd2_journal_handle

    the struct name was modified long ago, but the comment still
    use struct handle_s.

    Signed-off-by: Hui Su <sh_def@163.com>
sh@ubuntu:~/workspace/linux$
sh@ubuntu:~/workspace/linux$
sh@ubuntu:~/workspace/linux$ git format-patch HEAD^
0001-FIX-the-comment-of-struct-jbd2_journal_handle.patch
sh@ubuntu:~/workspace/linux$
```

如果第一个版本有问题则需要重新提第二个版本patch，与第一个版本差别就是加上 ' -v2'
 ' -v3' 等，
```
sh@ubuntu:~/workspace/linux-stable$ git format-patch HEAD^ -v2
v2-0001-tools-time-access-sys-kernel-debug-udelay_test-be.patch
```
在邮件发出之后会自动变成
[PATCH v2] tools/time: access /sys/kernel/debug/udelay_test before test



如果不是一个patch，而是一系列patch怎么办呢？
```
肯定是有办法的，目前我还没这个需求，留白，后续补充
lkml中的邮件格式：
[PATCH v6 00/25] Add support for Clang LTO
```

[git format-patch](https://cloud.tencent.com/developer/section/1138664)

## 找到修改代码部分的maintainer
1. 先用 `perl scripts/checkpatch.pl` 检查patch有无语法错误
2. 再用 `perl scripts/get_maintainer.pl` 获取patch修改的代码的 maintainer
```
sh@ubuntu:~/workspace/linux$ perl scripts/checkpatch.pl  0001-FIX-the-comment-of-struct-jbd2_journal_handle.patch
total: 0 errors, 0 warnings, 10 lines checked

0001-FIX-the-comment-of-struct-jbd2_journal_handle.patch has no obvious style problems and is ready for submission.
sh@ubuntu:~/workspace/linux$
sh@ubuntu:~/workspace/linux$ perl scripts/get_maintainer.pl  0001-FIX-the-comment-of-struct-jbd2_journal_handle.patch
"Theodore Ts'o" <tytso@mit.edu> (maintainer:JOURNALLING LAYER FOR BLOCK DEVICES (JBD2))
Jan Kara <jack@suse.com> (maintainer:JOURNALLING LAYER FOR BLOCK DEVICES (JBD2))
linux-ext4@vger.kernel.org (open list:JOURNALLING LAYER FOR BLOCK DEVICES (JBD2))
linux-kernel@vger.kernel.org (open list)
sh@ubuntu:~/workspace/linux$
```

## 安装配置邮件客户端
安装下面工具
```
sudo apt-get install sendmail
sudo apt  install mutt
sudo apt install smtp
```

配置一下
```
sh@ubuntu:~$ cat .muttrc
set sendmail="/usr/bin/msmtp"
set envelope_from=yes
set realname="Hui Su"
set from=sh_def@163.com
set use_from=yes
set envelope_from=yes
sh@ubuntu:~$
sh@ubuntu:~$
sh@ubuntu:~$
sh@ubuntu:~$ cat .msmtprc
account default
host smtp.163.com
port 25
from sh_def@163.com
auth plain
tls off
user sh_def@163.com
password #这里填授权码
sh@ubuntu:~$
```

测试一下
```
sh@ubuntu:~$ echo "test" |mutt -s "my_first_test" sh_def@163.com
sh@ubuntu:~$ echo "test" |mutt -s "my_first_test" xxxx@qq.com
```
吐槽一下，如果是第一次配置还是比较难搞的
参考[参考](https://learnku.com/articles/13307/mutt-mail-sending)

## git 配置
这个应该在 git commit 阶段就已经配置好了，不赘述


## 推送patch
只需要在各个邮箱之间加上,即可，不赘述


## 回复邮件
一般情况下社区大佬都会在几天到一周内回复你的patch邮件，如果你的patch需要修改，
然后你需要重新回复他们的邮件，这应该如何做呢

1. 第一步配置好fetchmail
```
sh@ubuntu:~$ sudo apt install fetchmail
[sudo] password for rlk:
Reading package lists... Done
Building dependency tree
Reading state information... Done
fetchmail is already the newest version (6.4.2-2).
0 upgraded, 0 newly installed, 0 to remove and 369 not upgraded.
sh@ubuntu:~$ cat ~/.fetchmailrc
poll pop3.163.com
protocol POP3
user "xxx@163.com"
password "客户端授权码"
sh@ubuntu:~$ ll | grep rc | grep fetch
-rwx------  1 rlk  rlk       83 10月  8 01:38 .fetchmailrc*

# 接收邮件
sh@ubuntu:~$ fetchmail  -v
fetchmail: 6.4.2 querying pop3.163.com (protocol POP3) at 2020年10月08日 星期四 01时38分51秒: poll started
Trying to connect to 220.181.12.110/110...connected.
fetchmail: POP3< +OK Welcome to coremail Mail Pop3 Server (163coms[10774b260cc7a37d26d71b52404dcf5cs])
fetchmail: POP3> CAPA
fetchmail: POP3< +OK Capability list follows
...............
```

2. 查看接收的邮件
然后直接 mutt 就可以看到接收到的邮件了
```
q:Quit  d:Del  u:Undel  s:Save  m:Mail  r:Reply  g:Group  ?:Help
   1 O + 9月 09 iovisor-dev@lis ( 378) [iovisor-dev] iovisor-dev@lists.iovisor.org Daily Summary
   2   + 9月 22 Mail Delivery S (  50) Returned mail: see transcript for details
   3   + 9月 22 Mail Delivery S (  50) Returned mail: see transcript for details
   4 O F 9月 23 To sh_def@163.c (  75) [PATCH] mm,page_alloc: fix the count of free pages
   5 O T 9月 23 Jan Kara        (  38) ┬─>Re: [PATCH] FIX the comment of struct jbd2_journal_handle
   6 O T 10月 03 Theodore Y. Ts' (  11) └─>Re: [PATCH] FIX the comment of struct jbd2_journal_handle
   7 O + 9月 25 Josh Poimboeuf  (   3) ┬─>Re: [PATCH] mm,kmemleak-test.c: move kmemleak-test.c to samples dir
   8 O T 10月 05 Catalin Marinas (  12) └─>Re: [PATCH] mm,kmemleak-test.c: move kmemleak-test.c to samples dir
   9 O T 9月 25 akpm@linux-foun ( 313) + mmkmemleak-testc-move-kmemleak-testc-to-samples-dir.patch added to -mm tree
  10 O T 9月 25 akpm@linux-foun (  92) + mm-fix-some-comments-in-page_allocc-and-mempolicyc.patch added to -mm tree
  11 O T 9月 28 Ira Weiny       (  57) Re: [PATCH] mm/vmalloc.c: check the addr first
  12 O T 9月 28 akpm@linux-foun (  56) + mm-vmscan-fix-comments-for-isolate_lru_page.patch added to -mm tree
  13 O T 9月 28 akpm@linux-foun (  59) + mm-vmallocc-update-the-comment-in-__vmalloc_area_node.patch added to -mm tree
  14 O T 9月 28 akpm@linux-foun (  66) + mm-vmallocc-fix-the-comment-of-find_vm_area.patch added to -mm tree
  15 O T 9月 28 akpm@linux-foun (  65) + mmz3fold-use-xx_zalloc-instead-xx_alloc-and-memset.patch added to -mm tree
  16 O + 9月 29 haifei.wang@car ( 312) 阿里云/今日头条Linux内核研发专家职位推荐
  17 O T 9月 29 Dietmar Eggeman (  59) Re: [PATCH] sched,fair: use list_for_each_entry() in print_cfs_stats()
  18 O + 9月 29 iovisor-dev@lis ( 378) [iovisor-dev] iovisor-dev@lists.iovisor.org Daily Summary
  19 O T 9月 29 Steven Rostedt  (  61) Re: [PATCH] sched/rt.c remove unnecessary parameter in pick_next_rt_entity
  20 O T 9月 30 boris.ostrovsky (  13) Re: [PATCH] arch/x86: fix some typos in xen_pagetable_p2m_free()
  21 O T 10月 01 David Hildenbra (  57) Re: [PATCH] mm: fix some comments in page_alloc.c and mempolicy.c
  22 O T 10月 01 Joe Perches     (  14) └─>
  23 O + 10月 01 iovisor-dev@lis ( 378) [iovisor-dev] iovisor-dev@lists.iovisor.org Daily Summary
  24 O   10月 02 George Worden   (   1)
  25 O T 10月 02 akpm@linux-foun (  81) [to-be-updated] mm-fix-some-comments-in-page_allocc-and-mempolicyc.patch removed from -mm tree
  26 O + 10月 08 流浪人          (  75) Re:[PATCH] mm/hugetlb.c: just use put_page_testzero() instead of page_count()


---Mutt: /var/mail/rlk [Msgs:26 Old:24 Post:8 174K]---(threads/date)---------------------------------------------------------------------------------------------------------------------------------(all)--
```

3. 回复邮件
[我的第一个patch](https://lkml.org/lkml/2020/9/22/824)










## 使用 git send-amail 发送邮件
1. 安装
```
apt-get install git-email
```

2. 首先需要先配置 ~/.gitconfig
```
[user]
        name = Hui Su
        email = suhui@xxx.com

[http]
    sslverify = false

[https]
    sslverify = false

[sendemail]
        smtpserver = smtp.office365.com
        smtpserverport = 587
        smtpuser = suhui@xxx.com
        smtpencryption = tls
        smtppass = xxx
```
注意不是 sendmail 而是sendemail

163 邮箱的配置
```
[user]
        name = Hui Su
        email = suhui_kernel@163.com
[core]
        editor = vim
[commit]
        template = ~/.git_ci.txt

[alias]
        co = checkout
        br = branch
        ci = commit
        st = status
        pl = pull
        ps = push
        last = log -1 HEAD
        unstage = reset HEAD --
        df = diff
        dfl = diff HEAD~
        dfc = diff --cached
        chp = cherry-pick
[core]
          editor = vim
        excludesfile = /home/sh/.gitignore_global
[color]
          ui = auto

[http]
    sslverify = false

[https]
    sslverify = false

[sendemail]
    forbidSendmailVariables = false
    from = suhui_kernel@163.com
    smtpserver = smtp.163.com
    smtpserverport = 25
    smtpuser = suhui_kernel@163.com
    smtppass = EBLEBUWTMOXNVAMC
    smtpencryption = tls
```

1. 直接发送
```
git send-email /tmp/0001-test.patch --to suhui@xxx.com --cc suhui199712@gmail.com
```

2. 回复邮件
```
git send-email \
    --in-reply-to=20220315084247.40783-10-mingo@kernel.org \
    --to=mingo@kernel.org \
    --cc=akpm@linux-foundation.org \
    --cc=masahiroy@kernel.org \
    /home/ubuntu/workspace/kvmtool/001.patch
```