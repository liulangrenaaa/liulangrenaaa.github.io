'use strict';

const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);
const generatedSvgMap = new Map();
const referencedSvgSet = new Set();
const mermaidWarnings = [];
const MARKDOWN_MERMAID_REGEX = /```mermaid\s*\n([\s\S]*?)```/g;
const HTML_HIGHLIGHT_BLOCK_REGEX = /<figure class="highlight plain">[\s\S]*?<\/figure>/g;
const PUBLIC_PREFIX = '/generated/mermaid';
const TMP_DIR = '.tmp/hexo-mermaid';
const SOURCE_OUTPUT_DIR = path.join('source', 'generated', 'mermaid');

// 计算 Mermaid 内容的稳定哈希，用于复用已生成的静态图文件名。
function buildDiagramHash(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

// 解码 Mermaid 代码块中的常见 HTML 实体，保证替换阶段能拿到原始语法。
function decodeHtml(content) {
  return content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (match, decimalCode) => String.fromCodePoint(Number(decimalCode)))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hexCode) => String.fromCodePoint(parseInt(hexCode, 16)));
}

// 记录 Mermaid 静态化过程中的告警，并同步输出到构建日志。
function pushMermaidWarning(hexo, message) {
  mermaidWarnings.push(message);
  hexo.log.warn(message);
}

// 规范化 Mermaid 源码内容，避免仅空白差异导致重复生成。
function normalizeMermaidSource(content) {
  return decodeHtml(content).replace(/\r\n/g, '\n').trim() + '\n';
}

// 从代码高亮后的 HTML 代码块中提取纯文本源码，供 Mermaid 静态化匹配使用。
function extractCodeTextFromHighlightBlock(blockHtml) {
  const codeCellMatch = blockHtml.match(/<td class="code"><pre>([\s\S]*?)<\/pre><\/td>/);
  if (!codeCellMatch) {
    return '';
  }

  return decodeHtml(
    codeCellMatch[1]
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/span>/g, '')
      .replace(/<span[^>]*>/g, '')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

// 判断高亮代码块是否实际承载的是 Mermaid 语法，而不是普通 plain 文本代码块。
function isMermaidCodeBlock(content) {
  const firstLine = content.split('\n').find((line) => line.trim().length > 0) || '';
  return /^(sequenceDiagram|flowchart|graph|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline)\b/.test(firstLine.trim());
}

// 返回 Mermaid 静态图在 source 目录中的绝对输出路径。
function getSourceSvgPath(hexo, fileName) {
  return path.join(hexo.base_dir, SOURCE_OUTPUT_DIR, fileName);
}

// 检测可复用的 Chromium 可执行文件路径，优先使用环境变量和 Playwright 缓存。
async function resolveChromeExecutable() {
  const candidatePaths = [
    process.env.MERMAID_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/home/lucas_wsl/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
    '/home/lucas_wsl/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ].filter(Boolean);

  for (const candidatePath of candidatePaths) {
    try {
      await fsPromises.access(candidatePath);
      return candidatePath;
    } catch (error) {
      continue;
    }
  }

  throw new Error('未找到可用的 Chromium 可执行文件，请设置 MERMAID_CHROME_PATH。');
}

// 递归收集 source 目录下需要参与 Mermaid 静态化的 Markdown 文件。
async function collectMarkdownFiles(rootDir) {
  const entries = await fsPromises.readdir(rootDir, { withFileTypes: true });
  const filePaths = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(path.join('source', 'generated'))) {
        continue;
      }
      filePaths.push(...await collectMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.md')) {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
}

// 调用 Mermaid CLI 在构建阶段把源码渲染成 SVG 文本。
async function renderMermaidSvg(hexo, sourceText, outputKey) {
  const baseDir = hexo.base_dir;
  const tempDir = path.join(baseDir, TMP_DIR);
  const inputPath = path.join(tempDir, `${outputKey}.mmd`);
  const outputPath = path.join(tempDir, `${outputKey}.svg`);
  const chromeExecutable = await resolveChromeExecutable();

  await fsPromises.mkdir(tempDir, { recursive: true });
  await fsPromises.writeFile(inputPath, sourceText, 'utf8');

  const mermaidConfigPath = path.join(baseDir, 'ops', 'mermaid-render-config.json');
  const puppeteerConfigPath = path.join(baseDir, 'ops', 'puppeteer-config.json');
  const mmdcBinPath = path.join(baseDir, 'node_modules', '.bin', 'mmdc');

  await execFileAsync(mmdcBinPath, [
    '-i', inputPath,
    '-o', outputPath,
    '-c', mermaidConfigPath,
    '-p', puppeteerConfigPath,
    '-b', '#ffffff'
  ], {
    cwd: baseDir,
    env: {
      ...process.env,
      PUPPETEER_SKIP_DOWNLOAD: '1',
      PUPPETEER_EXECUTABLE_PATH: chromeExecutable
    },
    maxBuffer: 10 * 1024 * 1024
  });

  return fsPromises.readFile(outputPath, 'utf8');
}

// 在 Mermaid 渲染失败时生成占位图，避免整站构建被单张图阻塞。
function buildMermaidFallbackSvg(message) {
  const safeMessage = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="320" viewBox="0 0 1600 320" style="background-color: #ffffff;">',
    '  <rect width="1600" height="320" fill="#ffffff"/>',
    '  <rect x="24" y="24" width="1552" height="272" rx="20" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>',
    '  <text x="64" y="110" font-size="40" fill="#9a3412" font-family="sans-serif">Mermaid 渲染异常</text>',
    `  <text x="64" y="170" font-size="24" fill="#7c2d12" font-family="sans-serif">${safeMessage}</text>`,
    '  <text x="64" y="220" font-size="22" fill="#9a3412" font-family="sans-serif">请查看构建日志中的 mermaid-static 告警。</text>',
    '</svg>'
  ].join('\n');
}

// 检查 Mermaid CLI 输出是否为错误占位图，并返回可用于日志展示的异常信息。
function getMermaidSvgWarning(svgText, outputKey) {
  if (svgText.includes('Syntax error in graph') || svgText.includes('mermaid version')) {
    return `[mermaid-static] Mermaid 图渲染异常: ${outputKey}`;
  }

  return '';
}

// 强制把 Mermaid SVG 处理成白底，并写入明确尺寸，避免 Fancybox 把它当成小图适配展示。
function ensureOpaqueSvgBackground(svgText) {
  let nextSvg = svgText.replace('background-color: transparent;', 'background-color: #ffffff;');
  const viewBoxMatch = nextSvg.match(/viewBox="([^"]+)"/);

  if (viewBoxMatch) {
    const viewBoxValues = viewBoxMatch[1].trim().split(/\s+/).map(Number);
    if (viewBoxValues.length === 4 && viewBoxValues.every((value) => Number.isFinite(value))) {
      const width = Math.ceil(viewBoxValues[2]);
      const height = Math.ceil(viewBoxValues[3]);
      nextSvg = nextSvg.replace(/width="[^"]*"/, `width="${width}"`);
      if (/height="[^"]*"/.test(nextSvg)) {
        nextSvg = nextSvg.replace(/height="[^"]*"/, `height="${height}"`);
      } else {
        nextSvg = nextSvg.replace(/<svg/, `<svg height="${height}"`);
      }
      nextSvg = nextSvg.replace(/style="([^"]*)"/, (match, styleValue) => {
        const normalized = styleValue
          .replace(/max-width\s*:\s*[^;]+;?/g, '')
          .replace(/width\s*:\s*[^;]+;?/g, '')
          .trim();
        const merged = ['background-color: #ffffff;', normalized].filter(Boolean).join(' ');
        return `style="${merged}"`;
      });
      nextSvg = nextSvg.replace(/<svg([^>]*)>/, `<svg$1><rect width="${width}" height="${height}" fill="#ffffff"/>`);
      return nextSvg;
    }
  }

  nextSvg = nextSvg.replace(/<svg([^>]*)>/, '<svg$1><rect width="100%" height="100%" fill="#ffffff"/>');
  return nextSvg;
}

// 把生成好的 SVG 写入 source/generated/mermaid，供后续拷贝到 public。
async function persistSvgToSource(hexo, fileName, svgText) {
  const sourceSvgPath = getSourceSvgPath(hexo, fileName);
  await fsPromises.mkdir(path.dirname(sourceSvgPath), { recursive: true });
  await fsPromises.writeFile(sourceSvgPath, svgText, 'utf8');
}

// 扫描 Markdown 源文件并预生成本次构建需要的所有 Mermaid 静态图。
async function prebuildMermaidSvgs(hexo) {
  const markdownFiles = await collectMarkdownFiles(path.join(hexo.base_dir, 'source'));

  for (const filePath of markdownFiles) {
    const markdownContent = await fsPromises.readFile(filePath, 'utf8');
    const matches = Array.from(markdownContent.matchAll(MARKDOWN_MERMAID_REGEX));

    for (const match of matches) {
      const normalizedSource = normalizeMermaidSource(match[1]);
      const diagramHash = buildDiagramHash(normalizedSource);
      const fileName = `${diagramHash}.svg`;

      if (generatedSvgMap.has(fileName)) {
        continue;
      }

      hexo.log.info(`[mermaid-static] 生成 ${fileName}`);
      let rawSvgText = '';
      let renderWarning = '';
      let warningAlreadyLogged = false;
      try {
        rawSvgText = await renderMermaidSvg(hexo, normalizedSource, diagramHash);
        renderWarning = getMermaidSvgWarning(rawSvgText, fileName);
      } catch (error) {
        renderWarning = `[mermaid-static] Mermaid CLI 执行失败: ${fileName}`;
        pushMermaidWarning(hexo, renderWarning);
        warningAlreadyLogged = true;
        rawSvgText = buildMermaidFallbackSvg(renderWarning);
      }

      if (renderWarning && !warningAlreadyLogged) {
        pushMermaidWarning(hexo, renderWarning);
      }

      const svgText = ensureOpaqueSvgBackground(rawSvgText);
      generatedSvgMap.set(fileName, svgText);
      await persistSvgToSource(hexo, fileName, svgText);
    }
  }
}

// 生成文章中插入的静态 SVG 图片 HTML，并接入 Fancybox 放大查看。
function buildMermaidFigureHtml(publicPath, altText) {
  const safeAltText = altText.replace(/"/g, '&quot;');
  return [
    '<figure style="margin:1.25rem 0;">',
    `  <a href="${publicPath}" data-fancybox="mermaid-diagrams" data-caption="${safeAltText}" style="display:block;cursor:zoom-in;">`,
    `    <img src="${publicPath}" alt="${safeAltText}" loading="lazy" style="display:block;width:100%;height:auto;border-radius:12px;border:1px solid rgba(15,23,42,.08);background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.08);">`,
    '  </a>',
    '  <figcaption style="margin-top:.5rem;font-size:.875rem;color:rgba(71,85,105,.9);text-align:center;">点击放大查看原图</figcaption>',
    '</figure>'
  ].join('\n');
}

// 根据 Mermaid 源码内容生成静态图引用 HTML，供 Markdown 渲染前直接替换代码块。
function buildMermaidFigureFromSource(hexo, sourceContent, postTitle, index) {
  const normalizedSource = normalizeMermaidSource(sourceContent);
  const diagramHash = buildDiagramHash(normalizedSource);
  const fileName = `${diagramHash}.svg`;
  if (!generatedSvgMap.has(fileName)) {
    pushMermaidWarning(hexo, `[mermaid-static] Mermaid 图引用缺失: title=${postTitle || 'unknown'}, index=${index + 1}, file=${fileName}`);
    return '';
  }

  referencedSvgSet.add(fileName);
  const publicPath = `${PUBLIC_PREFIX}/${fileName}`;
  const altText = `${postTitle || 'Mermaid 图'} - 图 ${index + 1}`;

  return buildMermaidFigureHtml(publicPath, altText);
}

// 兼容少量仍以 Mermaid 预标签输出的场景，在 HTML 阶段继续兜底替换。
function replaceResidualHtmlMermaidBlocks(hexo, htmlContent, postTitle) {
  const htmlMermaidRegex = /<pre class="mermaid">([\s\S]*?)<\/pre>/g;
  let replacedContent = htmlContent;

  const preMatches = Array.from(replacedContent.matchAll(htmlMermaidRegex));
  for (let index = 0; index < preMatches.length; index += 1) {
    const fullMatch = preMatches[index][0];
    const figureHtml = buildMermaidFigureFromSource(hexo, preMatches[index][1], postTitle, index);
    if (figureHtml) {
      replacedContent = replacedContent.replace(fullMatch, figureHtml);
    }
  }

  let highlightIndex = preMatches.length;
  const highlightMatches = Array.from(replacedContent.matchAll(HTML_HIGHLIGHT_BLOCK_REGEX));
  for (const match of highlightMatches) {
    const fullMatch = match[0];
    const codeText = extractCodeTextFromHighlightBlock(fullMatch);
    if (!codeText || !isMermaidCodeBlock(codeText)) {
      continue;
    }

    const figureHtml = buildMermaidFigureFromSource(hexo, codeText, postTitle, highlightIndex);
    highlightIndex += 1;
    if (figureHtml) {
      replacedContent = replacedContent.replace(fullMatch, figureHtml);
    }
  }

  return replacedContent;
}

// 同步把 source/generated/mermaid 拷贝到 public/generated/mermaid，确保 generate 结束后资源在位。
function copyGeneratedSvgsToPublic(hexo) {
  const sourceDir = path.join(hexo.base_dir, SOURCE_OUTPUT_DIR);
  const publicDir = path.join(hexo.public_dir, 'generated', 'mermaid');

  fs.rmSync(publicDir, { recursive: true, force: true });
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(path.dirname(publicDir), { recursive: true });
  fs.cpSync(sourceDir, publicDir, { recursive: true });
}

// 校验所有注入到 HTML 的 Mermaid 静态图都已成功复制到 public，并将缺失项写入日志。
function validateReferencedSvgs(hexo) {
  for (const fileName of referencedSvgSet) {
    const publicSvgPath = path.join(hexo.public_dir, 'generated', 'mermaid', fileName);
    if (!fs.existsSync(publicSvgPath)) {
      pushMermaidWarning(hexo, `[mermaid-static] Mermaid 静态图缺失: ${publicSvgPath}`);
    }
  }
}

// 生成首页展示的 Mermaid 异常摘要，提醒有图需要人工复核。
function buildHomepageWarningHtml() {
  const items = mermaidWarnings.slice(0, 6).map((message) => `<li>${message.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('');
  const extraCount = Math.max(0, mermaidWarnings.length - 6);
  const extraLine = extraCount > 0 ? `<p style="margin:.5rem 0 0 0;font-size:.9rem;opacity:.8;">另有 ${extraCount} 条告警已写入构建日志。</p>` : '';

  return [
    '<section id="mermaid-build-warning" style="margin:1rem 0 1.25rem 0;padding:1rem 1.25rem;border-radius:16px;border:1px solid rgba(245,158,11,.35);background:rgba(245,158,11,.10);color:inherit;">',
    '  <h2 style="margin:0 0 .5rem 0;font-size:1.05rem;">Mermaid 构建告警</h2>',
    '  <p style="margin:0 0 .5rem 0;font-size:.95rem;">部分 Mermaid 图在静态化阶段存在异常，请结合构建日志复核。</p>',
    `  <ul style="margin:0;padding-left:1.25rem;">${items}</ul>`,
    `  ${extraLine}`,
    '</section>'
  ].join('\n');
}

// 将 Mermaid 告警摘要注入首页 HTML，避免异常被静默忽略。
function injectHomepageWarningToHtml(htmlContent) {
  if (mermaidWarnings.length === 0) {
    return htmlContent;
  }

  if (htmlContent.includes('id="mermaid-build-warning"')) {
    return htmlContent;
  }

  const warningHtml = buildHomepageWarningHtml();
  return htmlContent.replace('<div class="post-list post">', `${warningHtml}\n<div class="post-list post">`);
}

// 在每次 generate 前清空缓存并重建 source/generated/mermaid 目录。
hexo.extend.filter.register('before_generate', async function () {
  generatedSvgMap.clear();
  referencedSvgSet.clear();
  mermaidWarnings.length = 0;
  await fsPromises.rm(path.join(hexo.base_dir, SOURCE_OUTPUT_DIR), { recursive: true, force: true });
  await prebuildMermaidSvgs(hexo);
});

// 在 HTML 输出阶段继续兜底处理残留 Mermaid 预标签。
hexo.extend.filter.register('after_render:html', function (htmlContent, data) {
  if (!htmlContent) {
    return htmlContent;
  }

  if (htmlContent.indexOf('<pre class="mermaid">') === -1 && htmlContent.indexOf('<figure class="highlight plain">') === -1) {
    if (data && data.path === 'index.html') {
      return injectHomepageWarningToHtml(htmlContent);
    }
    return htmlContent;
  }

  let nextHtml = replaceResidualHtmlMermaidBlocks(hexo, htmlContent, data && data.title);
  if (data && data.path === 'index.html') {
    nextHtml = injectHomepageWarningToHtml(nextHtml);
  }
  return nextHtml;
});

// 在 generate 收尾阶段同步拷贝 Mermaid SVG，避免资源引用落空。
hexo.extend.filter.register('after_generate', function () {
  copyGeneratedSvgsToPublic(hexo);
  validateReferencedSvgs(hexo);
});
