# AGENTS.md

## 开发流程

1. 修改源文件（markdown、配置等）
2. 本地预览只重启 `hexo-preview-local.service`，不要手动运行 `npm run build`
3. 只有用户明确要求“发布”或“提交并推送”时，才执行 `git add . && git commit -m "xxx" && git push`
4. Push 到 GitHub 后会自动触发部署

## 注意事项

- 没有明确要求构建时，不要运行 `npm run build`、`hexo generate` 或其他生成静态页面的命令。
- 即使需要刷新本地预览，也不要手动运行 `npm run build`；只执行 `sudo systemctl restart hexo-preview-local.service`。
- 没有明确要求发布时，不要执行 commit、push 或触发部署相关操作。
- 后续 Push 到 GitHub 上都使用 SSH Key。
- 不需要手动运行 `npm run server` 或 `hexo server`。
- 本仓库分支为 `source`，部署由 GitHub Actions 自动完成

## AOSP 分析约束

- 后续涉及 AOSP 源码分析、Android Framework 机制说明、源码路径引用等内容时，默认统一基于 `aosp14`。
- 如果是在 Linux 上，代码目录在 `/home/suhui/workspace/aosp/los21/frameworks`。
