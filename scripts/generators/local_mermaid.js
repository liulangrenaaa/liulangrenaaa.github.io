'use strict';

const fs = require('hexo-fs');
const path = require('path');

// 生成本地 Mermaid 静态资源，避免构建阶段再解析大体积脚本。
hexo.extend.generator.register('local_mermaid_asset', function () {
  const mermaidPath = path.join(hexo.base_dir, 'vendor', 'mermaid.min.js');

  return [{
    path: 'js/vendor/mermaid.min.js',
    data: () => fs.createReadStream(mermaidPath)
  }];
});
