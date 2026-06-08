---
title: 个人简历
date: 2025-01-01 00:00:00
type: "resume"
comments: false
share: false
sitemap: false
indexing: false
breadcrumb: false
leftbar: []
rightbar: []
---
<style>
  .l_body[type="resume"] {
    display: block;
    max-width: none;
    padding: 32px 16px 56px;
  }

  .l_body[type="resume"] .l_left,
  .l_body[type="resume"] .l_right,
  .l_body[type="resume"] .article.banner,
  .l_body[type="resume"] .l_main > header,
  .l_body[type="resume"] .page-footer,
  .l_body[type="resume"] .footer {
    display: none !important;
  }

  .l_body[type="resume"] .l_main {
    max-width: none;
    padding: 0;
  }

  .l_body[type="resume"] article.md-text.content {
    padding: 0;
    overflow: visible;
  }

  .l_body[type="resume"] article.md-text.content > style {
    display: none;
  }

  .resume-toolbar {
    width: min(210mm, calc(100vw - 32px));
    margin: 0 auto 16px;
    display: flex;
    justify-content: flex-end;
  }

  .resume-print-button {
    border: 1px solid #2563eb;
    border-radius: 6px;
    background: #2563eb;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    padding: 10px 16px;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);
  }

  .resume-print-button:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
  }

  .resume-sheet {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 14mm 16mm;
    box-sizing: border-box;
    background: #fff;
    color: #111827;
    box-shadow: 0 18px 55px rgba(15, 23, 42, 0.18);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans CJK SC", "Microsoft YaHei", Arial, sans-serif;
    font-size: 10.8pt;
    line-height: 1.46;
  }

  .resume-sheet,
  .resume-sheet * {
    box-sizing: border-box;
  }

  .resume-sheet a {
    color: inherit;
    text-decoration: none;
  }

  .resume-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 18px;
    padding-bottom: 11px;
    border-bottom: 2px solid #111827;
  }

  .resume-name {
    margin: 0;
    color: #111827;
    font-size: 26pt;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0;
  }

  .resume-title {
    margin-top: 8px;
    color: #374151;
    font-size: 12.5pt;
    font-weight: 650;
  }

  .resume-contact {
    margin: 0;
    padding: 0;
    list-style: none;
    color: #374151;
    font-size: 9.8pt;
    line-height: 1.55;
    text-align: right;
    white-space: nowrap;
  }

  .resume-contact li {
    margin: 0;
  }

  .resume-summary {
    margin: 10px 0 0;
    color: #1f2937;
    font-size: 10.6pt;
  }

  .resume-section {
    margin-top: 12px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .resume-section-title {
    margin: 0 0 7px;
    padding-bottom: 3px;
    border-bottom: 1px solid #d1d5db;
    color: #111827;
    font-size: 12.2pt;
    font-weight: 800;
    line-height: 1.2;
  }

  .resume-skill-grid {
    display: grid;
    grid-template-columns: 70px 1fr;
    row-gap: 5px;
    column-gap: 12px;
  }

  .resume-skill-name {
    color: #111827;
    font-weight: 750;
  }

  .resume-skill-detail {
    color: #1f2937;
  }

  .resume-item {
    margin-top: 9px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .resume-item:first-of-type {
    margin-top: 0;
  }

  .resume-item-head {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: baseline;
  }

  .resume-item-title {
    color: #111827;
    font-size: 11.2pt;
    font-weight: 800;
  }

  .resume-item-subtitle {
    margin-top: 2px;
    color: #374151;
    font-size: 10pt;
    font-weight: 650;
  }

  .resume-time {
    color: #4b5563;
    font-size: 9.8pt;
    font-weight: 650;
    white-space: nowrap;
  }

  .resume-list {
    margin: 5px 0 0 0;
    padding-left: 16px;
    color: #1f2937;
  }

  .resume-list li {
    margin: 2px 0;
  }

  .resume-highlight {
    color: #111827;
    font-weight: 750;
  }

  @media screen and (max-width: 820px) {
    .l_body[type="resume"] {
      padding: 16px 10px 36px;
    }

    .resume-toolbar,
    .resume-sheet {
      width: 100%;
    }

    .resume-sheet {
      min-height: auto;
      padding: 22px 18px;
    }

    .resume-header,
    .resume-item-head {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .resume-contact {
      text-align: left;
      white-space: normal;
    }

    .resume-skill-grid {
      grid-template-columns: 1fr;
      row-gap: 2px;
    }
  }

  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    html,
    body {
      width: 210mm;
      min-height: 297mm;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    body > .sitebg,
    body > .scripts,
    .resume-toolbar,
    .main-mask,
    .float-panel,
    .l_body[type="resume"] .l_left,
    .l_body[type="resume"] .l_right,
    .l_body[type="resume"] .article.banner,
    .l_body[type="resume"] .l_main > header,
    .l_body[type="resume"] .page-footer,
    .l_body[type="resume"] .footer {
      display: none !important;
    }

    .l_body[type="resume"] {
      display: block !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    .l_body[type="resume"] .l_main,
    .l_body[type="resume"] article.md-text.content {
      display: block !important;
      width: 210mm !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: #fff !important;
    }

    .resume-sheet {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 14mm 16mm !important;
      box-shadow: none !important;
      color: #111827 !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    .resume-section,
    .resume-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
</style>
<div class="resume-toolbar">
  <button class="resume-print-button" type="button" onclick="window.print()">导出 PDF</button>
</div>
<main class="resume-sheet">
  <header class="resume-header">
    <div>
      <h1 class="resume-name">XXX</h1>
      <div class="resume-title">高级系统工程师 / Android Framework / Linux Kernel</div>
      <p class="resume-summary">
        长期从事 Android Framework、Linux 内核、系统性能优化与稳定性分析工作，熟悉从应用启动、窗口系统、调度、内存到问题定位闭环的系统级分析方法。
      </p>
    </div>
    <ul class="resume-contact">
      <li>电话：138-xxxx-xxxx</li>
      <li>邮箱：xxx@example.com</li>
      <li>GitHub：github.com/xxx</li>
      <li>所在地：中国</li>
    </ul>
  </header>
  <section class="resume-section">
    <h2 class="resume-section-title">专业技能</h2>
    <div class="resume-skill-grid">
      <div class="resume-skill-name">Android</div>
      <div class="resume-skill-detail">熟悉 Android Framework、应用启动与生命周期、WMS/Input/Binder、系统服务、ANR/Crash 稳定性分析。</div>
      <div class="resume-skill-name">Linux</div>
      <div class="resume-skill-detail">熟悉 Linux 内核调度、内存管理、文件系统、锁机制、驱动调试、异常现场分析与问题复盘。</div>
      <div class="resume-skill-name">性能优化</div>
      <div class="resume-skill-detail">具备启动速度、功耗、卡顿、低内存、CPU 调度、系统稳定性等问题的定位和优化经验。</div>
      <div class="resume-skill-name">工具链</div>
      <div class="resume-skill-detail">熟悉 Perfetto/Systrace、logcat、dumpsys、crash、gdb、kdump、QEMU、ADB、脚本化分析工具。</div>
    </div>
  </section>
  <section class="resume-section">
    <h2 class="resume-section-title">工作经历</h2>
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          <div class="resume-item-title">XXX 公司</div>
          <div class="resume-item-subtitle">高级系统工程师</div>
        </div>
        <div class="resume-time">2020 - 至今</div>
      </div>
      <ul class="resume-list">
        <li>负责 Android Framework 层开发与系统问题定位，覆盖应用启动、窗口系统、输入系统、系统服务等模块。</li>
        <li>负责系统性能优化，针对启动耗时、调度延迟、内存压力、功耗发热等问题建立分析路径并推进优化落地。</li>
        <li>负责稳定性问题分析，长期处理 ANR、Crash、Watchdog、Softlockup、低内存等复杂系统问题。</li>
      </ul>
    </article>
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          <div class="resume-item-title">YYY 公司</div>
          <div class="resume-item-subtitle">系统工程师</div>
        </div>
        <div class="resume-time">2018 - 2020</div>
      </div>
      <ul class="resume-list">
        <li>负责 Linux 内核驱动开发、系统调试和稳定性问题分析。</li>
        <li>参与调试工具开发，提升问题复现、日志采集和现场分析效率。</li>
      </ul>
    </article>
  </section>
  <section class="resume-section">
    <h2 class="resume-section-title">项目经历</h2>
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          <div class="resume-item-title">项目一：XXX 性能优化</div>
          <div class="resume-item-subtitle">启动速度 / 调度 / 资源瓶颈优化</div>
        </div>
        <div class="resume-time">核心项目</div>
      </div>
      <ul class="resume-list">
        <li>基于 trace、日志和系统调用链路拆解关键路径，定位启动阶段的阻塞点与资源竞争问题。</li>
        <li>推动关键路径优化，最终实现启动速度提升 <span class="resume-highlight">30%</span>。</li>
        <li>沉淀可复用分析方法，提升后续同类性能问题定位效率。</li>
      </ul>
    </article>
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          <div class="resume-item-title">项目二：YYY 稳定性提升</div>
          <div class="resume-item-subtitle">ANR / Crash / 系统稳定性治理</div>
        </div>
        <div class="resume-time">核心项目</div>
      </div>
      <ul class="resume-list">
        <li>系统性分析 ANR、Crash 与低内存问题，建立从现象、日志、trace 到根因的排查流程。</li>
        <li>累计解决 ANR 问题 <span class="resume-highlight">100+</span>，推动 Crash 率降低 <span class="resume-highlight">50%</span>。</li>
        <li>输出问题复盘和排查模板，帮助团队形成稳定性治理闭环。</li>
      </ul>
    </article>
  </section>
  <section class="resume-section">
    <h2 class="resume-section-title">教育背景</h2>
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          <div class="resume-item-title">XXX 大学</div>
          <div class="resume-item-subtitle">计算机科学与技术 / 本科</div>
        </div>
        <div class="resume-time">2014 - 2018</div>
      </div>
    </article>
  </section>
</main>
