# AGENTS.md

## 开发流程

1. 修改源文件（markdown、配置等）
2. 运行 `npm run build` 生成静态页面，本地预览 service 会自动重启
3. 确认无误后 `git add . && git commit -m "xxx" && git push`
4. Push 到 GitHub 后会自动触发部署

## 注意事项

- 后续 Push 到 GitHub 上都使用 SSH Key。
- 不需要手动运行 `npm run server` 或 `hexo server`，`npm run build` 完成之后 service 会自动重启
- 本仓库分支为 `source`，部署由 GitHub Actions 自动完成

## AOSP 分析约束

- 后续涉及 AOSP 源码分析、Android Framework 机制说明、源码路径引用等内容时，默认统一基于 `aosp14`。
