# AGENTS.md

## 仓库状态

- 当前博客系统为 Astro + MDX。
- `source` 分支是当前源码分支。
- `source-hexo` 分支是旧 Hexo 源码备份分支，只用于查历史内容，不再作为开发分支。
- `master` 分支是 GitHub Actions 生成的静态页面发布分支，不要手动修改。

## 开发流程

1. 修改源码、Markdown、MDX、样式或配置。
2. 本地预览使用 `npm run dev`。
3. 普通内容与样式调整不需要主动构建。
4. 只有用户明确要求“发布”“提交并推送”“部署”时，才执行提交与推送。
5. 发布前应先执行 `npm run build`，确认 Astro 检查和静态构建通过。
6. 提交时使用 `git add -A`，确保新增、修改、删除都被纳入提交。
7. Push 到远程 `source` 后会自动触发 GitHub Actions 部署。

## 注意事项

- 没有明确要求构建或发布前验证时，不要运行 `npm run build` 或其他生成静态页面的命令。
- 没有明确要求发布时，不要执行 commit、push 或触发部署相关操作。
- 后续 Push 到 GitHub 上都使用 SSH Key。
- 不需要手动运行额外静态服务器；本地预览只使用 Astro dev server。
- 不要手动修改 `master` 分支的部署产物。
- 不要把 `dist/`、`.astro/`、`node_modules/` 加入版本控制。
- 不要恢复 Hexo 配置、Hexo 脚本、Hexo theme 或旧 `source/_posts` 目录。

## 目录约定

- 博客文章放在 `src/content/blog/`。
- 专题报告源文件放在 `src/content/reports/`。
- 页面入口放在 `src/pages/`。
- 页面布局放在 `src/layouts/`。
- 全局样式放在 `src/styles/global.css`。
- 静态资源放在 `public/`，发布时会原样复制到站点根目录。

## 部署流程

- GitHub Actions workflow 位于 `.github/workflows/deploy.yml`。
- 只有 push 到远程 `source` 分支会自动触发部署。
- Actions 使用 Node.js 24，执行 `npm ci` 和 `npm run build`。
- 构建产物位于 `dist/`。
- Actions 会把 `dist/` 强推到远程 `master` 分支。
- GitHub Pages 从 `master` 分支发布静态页面。

## AOSP 分析约束

- 后续涉及 AOSP 源码分析、Android Framework 机制说明、源码路径引用等内容时，默认统一基于 `aosp14`。
- 如果是在 Linux 上，代码目录在 `/home/suhui/workspace/aosp/los21/frameworks`。
