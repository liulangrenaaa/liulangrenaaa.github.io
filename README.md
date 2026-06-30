# liulangren Blog

这是一个基于 Astro + MDX 的个人技术博客，内容主要是 Android、Linux 内核、系统性能和稳定性分析笔记。

## 本地开发

```bash
npm ci
npm run dev
```

默认本地地址：

```text
http://localhost:4321/
```

## 构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## 内容目录

- `src/content/blog/`：博客文章
- `src/content/reports/`：专题报告
- `src/pages/`：页面路由
- `src/layouts/`：页面布局
- `src/styles/`：全局样式
- `public/`：静态资源

## 部署

Push 到 GitHub 后由 GitHub Actions 构建 Astro 静态站点，并发布 `dist/` 到 `master` 分支。
