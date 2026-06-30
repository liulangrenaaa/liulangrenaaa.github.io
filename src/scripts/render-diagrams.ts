type DiagramRenderer = (source: string, index: number) => Promise<string>;

const diagramLanguages = ['mermaid', 'dot', 'graphviz', 'plantuml', 'puml', 'd2'];

// 获取代码块中的原始文本，供图表渲染器使用。
function getBlockSource(block: Element) {
  return block.textContent?.trim() ?? '';
}

// 创建统一的图表容器，替换原始代码块。
function replaceWithDiagramContainer(block: Element, language: string) {
  const diagram = document.createElement('div');
  diagram.className = `diagram diagram-${language}`;
  block.replaceWith(diagram);
  return diagram;
}

// 渲染 Mermaid 流程图。
async function renderMermaid(source: string, index: number) {
  const mermaid = (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'base',
    themeVariables: {
      fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
      primaryColor: '#eef2ff',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#8b5cf6',
      lineColor: '#334155',
      secondaryColor: '#ecfeff',
      tertiaryColor: '#f8fafc',
      clusterBkg: '#f8fafc',
      clusterBorder: '#cbd5e1',
      edgeLabelBackground: '#ffffff'
    },
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      padding: 18
    }
  });

  const result = await mermaid.render(`mermaid-${index}`, source);
  return result.svg;
}

// 渲染 Graphviz DOT 图。
async function renderGraphviz(source: string) {
  const { Graphviz } = await import('@hpcc-js/wasm');
  const graphviz = await Graphviz.load();
  return graphviz.dot(source, 'svg');
}

// 渲染 PlantUML 图，使用官方公开服务生成 SVG。
async function renderPlantUml(source: string) {
  const encoder = await import('plantuml-encoder');
  const encoded = encoder.encode(source);
  const src = `https://www.plantuml.com/plantuml/svg/${encoded}`;
  return `<img src="${src}" alt="PlantUML diagram" loading="lazy" referrerpolicy="no-referrer" />`;
}

// 渲染 D2 图。
async function renderD2(source: string) {
  const { D2 } = await import('@terrastruct/d2');
  const d2 = new D2();
  const result = await d2.compile(source);
  return d2.render(result.diagram, {
    ...result.renderOptions,
    noXMLTag: true
  });
}

// 根据代码块语言选择对应图表渲染器。
function getRenderer(language: string): DiagramRenderer | undefined {
  switch (language) {
    case 'mermaid':
      return renderMermaid;
    case 'dot':
    case 'graphviz':
      return renderGraphviz;
    case 'plantuml':
    case 'puml':
      return renderPlantUml;
    case 'd2':
      return renderD2;
    default:
      return undefined;
  }
}

// 将支持的 fenced code block 转换为可视化图表。
async function renderDiagramBlocks() {
  const selector = diagramLanguages.map((language) => `pre[data-language="${language}"]`).join(',');
  const blocks = Array.from(document.querySelectorAll(selector));

  for (const [index, block] of blocks.entries()) {
    const language = block.getAttribute('data-language') ?? '';
    const source = getBlockSource(block);
    const renderer = getRenderer(language);

    if (!source || !renderer) {
      continue;
    }

    const diagram = replaceWithDiagramContainer(block, language);

    try {
      diagram.innerHTML = await renderer(source, index);
    } catch (error) {
      diagram.classList.add('diagram-error');
      diagram.textContent = source;
      console.error(`${language} render failed:`, error);
    }
  }
}

renderDiagramBlocks();
