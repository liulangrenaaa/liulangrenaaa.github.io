import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

export default defineConfig({
  site: 'https://liulangrenaaa.github.io',
  integrations: [mdx()],
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]],
      rehypePlugins: [rehypeKatex]
    }),
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
