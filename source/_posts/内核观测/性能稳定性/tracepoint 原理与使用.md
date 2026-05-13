---
title: tracepoint 原理与使用
date: 2021-09-14 19:00:00
tags:
    - tracepoint
    - aarch64
categories:
    - kernel debug
---






## 使用






## 数据结构
每个 `tracepoint` 对应一个 `struct tracepoint` 结构：
```
struct tracepoint {
	const char *name;		/* Tracepoint name */
	struct static_key key;
	struct static_call_key *static_call_key;
	void *static_call_tramp;
	void *iterator;
	int (*regfunc)(void);
	void (*unregfunc)(void);
	struct tracepoint_func __rcu *funcs;
};
```


```
enum {
	TRACE_EVENT_FL_FILTERED		= (1 << TRACE_EVENT_FL_FILTERED_BIT),
	TRACE_EVENT_FL_CAP_ANY		= (1 << TRACE_EVENT_FL_CAP_ANY_BIT),
	TRACE_EVENT_FL_NO_SET_FILTER	= (1 << TRACE_EVENT_FL_NO_SET_FILTER_BIT),
	TRACE_EVENT_FL_IGNORE_ENABLE	= (1 << TRACE_EVENT_FL_IGNORE_ENABLE_BIT),
	TRACE_EVENT_FL_TRACEPOINT	= (1 << TRACE_EVENT_FL_TRACEPOINT_BIT),
	TRACE_EVENT_FL_DYNAMIC		= (1 << TRACE_EVENT_FL_DYNAMIC_BIT),
	TRACE_EVENT_FL_KPROBE		= (1 << TRACE_EVENT_FL_KPROBE_BIT),
	TRACE_EVENT_FL_UPROBE		= (1 << TRACE_EVENT_FL_UPROBE_BIT),
	TRACE_EVENT_FL_EPROBE		= (1 << TRACE_EVENT_FL_EPROBE_BIT),
};
```





```
enum {
	EVENT_FILE_FL_ENABLED		= (1 << EVENT_FILE_FL_ENABLED_BIT),
	EVENT_FILE_FL_RECORDED_CMD	= (1 << EVENT_FILE_FL_RECORDED_CMD_BIT),
	EVENT_FILE_FL_RECORDED_TGID	= (1 << EVENT_FILE_FL_RECORDED_TGID_BIT),
	EVENT_FILE_FL_FILTERED		= (1 << EVENT_FILE_FL_FILTERED_BIT),
	EVENT_FILE_FL_NO_SET_FILTER	= (1 << EVENT_FILE_FL_NO_SET_FILTER_BIT),
	EVENT_FILE_FL_SOFT_MODE		= (1 << EVENT_FILE_FL_SOFT_MODE_BIT),
	EVENT_FILE_FL_SOFT_DISABLED	= (1 << EVENT_FILE_FL_SOFT_DISABLED_BIT),
	EVENT_FILE_FL_TRIGGER_MODE	= (1 << EVENT_FILE_FL_TRIGGER_MODE_BIT),
	EVENT_FILE_FL_TRIGGER_COND	= (1 << EVENT_FILE_FL_TRIGGER_COND_BIT),
	EVENT_FILE_FL_PID_FILTER	= (1 << EVENT_FILE_FL_PID_FILTER_BIT),
	EVENT_FILE_FL_WAS_ENABLED	= (1 << EVENT_FILE_FL_WAS_ENABLED_BIT),
};
```



https://www.cnblogs.com/honpey/p/9256279.html

https://www.cnblogs.com/honpey/p/9012016.html