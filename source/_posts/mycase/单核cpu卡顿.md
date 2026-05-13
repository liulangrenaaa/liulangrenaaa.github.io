---
title: 单核cpu卡顿
date: 2022-12-10 19:00:40
tags:
    - single cpu
    - cpu jank
categories:
    - linux内核
---


## 写在前面
之前在DJI 某个项目中，使用的自研芯片P1做的飞行眼镜，在后续量产过程中发现回放录制的视频的时候会导致卡音，在pro版本的飞行眼镜中没有这个问题。





## 溯源
直接使用 systrace 抓一份trace，因为这是开机第一次回放视频必现的问题，很好复现。

在 systrace 中看到 `snd_soc_dapm_done` 中卡了近1s，这个线程是音频线程，所以是rt的，系统中能抢占他的 线程不多。(人耳对音频极敏感，所以音频编解码线程都是rt的，在系统中优先级很高。)

所以为啥 音频线程被 block了近1s呢？
1. 关了中断，不能及时调度导致的
2. 需要获取锁资源，但是一直未能获取到。

```
static int dapm_power_widgets(struct snd_soc_card *card, int event)
{
//......
/* Run other bias changes in parallel */
 list_for_each_entry(d, &card->dapm_list, list) {
  if (d != &card->dapm)
   async_schedule_domain(dapm_pre_sequence_async, d,
      &async_domain);
 }
 async_synchronize_full_domain(&async_domain);
//......
trace_snd_soc_dapm_done(card);
return 0;
}
```
查看了相关systrace 发现是 `async_synchronize_full_domain` 等待时间太久, 这个函数看注释会等 func 执行完成才会返回。


```
/**
 * async_synchronize_full_domain - synchronize all asynchronous function within a certain domain
 * @domain: the domain to synchronize
 *
 * This function waits until all asynchronous function calls for the
 * synchronization domain specified by @domain have been done.
 */
void async_synchronize_full_domain(struct async_domain *domain)
{
	async_synchronize_cookie_domain(ASYNC_COOKIE_MAX, domain);
}
EXPORT_SYMBOL_GPL(async_synchronize_full_domain);
```

由于`dapm_power_widgets` 是rt优先级的。但是 通过`async_synchronize_full_domain` 异步执行 func的线程是普通优先级的，相对于音频线程的优先级被降级了，降级到普通cfs线程中去work了，此时系统中正好还有一个 rt 线程，但是比 音频rt线程优先级低的线程。就导致 整个音频线程卡住了，类似于优先级翻转的效果。就是因为一个异步函数调用执行。

但其实如果是多核SMP系统的话，这个问题其实不一定会暴露出来，但是P1 芯片平台是一个单核的soc，且算力较弱，所以这个问题几乎必现。






参考[ALSA子系统的一次性能优化](https://mp.weixin.qq.com/s/M35WBcmSt1hlali8dWKikA)
