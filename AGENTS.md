# AGENTS.md

## 开发流程

1. 修改源文件（markdown、配置等）
2. 运行 `npm run build` 生成静态页面，本地预览 service 会自动重启
3. 确认无误后 `git add . && git commit -m "xxx" && git push`
4. Push 到 GitHub 后会自动触发部署

## 注意事项

- 不需要手动运行 `npm run server` 或 `hexo server`，`npm run build` 完成之后 service 会自动重启
- 本仓库分支为 `source`，部署由 GitHub Actions 自动完成
