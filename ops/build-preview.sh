#!/usr/bin/env bash
set -euo pipefail

# 生成站点并在成功后刷新预览服务。
main() {
  local service_pid=""

  ./node_modules/.bin/hexo generate "$@"

  service_pid="$(lsof -t -iTCP:4000 -sTCP:LISTEN -n -P | head -n1 || true)"
  if [[ -z "${service_pid}" ]]; then
    echo "hexo-preview.service 未运行，跳过预览服务刷新。"
    return 0
  fi

  echo "刷新 hexo-preview.service，旧进程 PID: ${service_pid}"
  kill -9 "${service_pid}"
}

main "$@"
