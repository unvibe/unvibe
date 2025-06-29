import MarkdownIt from 'markdown-it-async';
import { codeToHtml } from 'shiki';

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: async (str, lang) => {
    return await codeToHtml(str, {
      lang,
      theme: 'github-dark',
    });
  },
});

export async function parseMarkdown(markdown: string): Promise<string> {
  // markdown-it is synchronous
  return md.render(markdown);
}

export type Decorations = Parameters<typeof codeToHtml>[1]['decorations'];

export async function highlightCode(
  code: string,
  lang: string,
  decorations?: Decorations
): Promise<string> {
  console.log('found decorations', decorations);
  return codeToHtml(code, {
    lang,
    theme: 'github-dark',
    decorations,
  });
}
