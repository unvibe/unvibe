import MarkdownIt from 'markdown-it-async';
import { codeToHtml } from 'shiki';

export function parseMarkdownSync(markdown: string, theme: string): string {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: async (str, lang) => {
      return await codeToHtml(str, {
        lang,
        theme,
      });
    },
  });

  try {
    // markdown-it is synchronous
    return md.render(markdown);
  } catch (error) {
    console.error('Error parsing markdown:', error);
    console.error('Markdown content:', markdown);
    return '';
  }
}

export function parseMarkdown(
  markdown: string,
  theme: string
): Promise<string> {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: async (str, lang) => {
      return await codeToHtml(str, {
        lang,
        theme,
      });
    },
  });

  // markdown-it is synchronous
  return md.renderAsync(markdown);
}

export type Decorations = Parameters<typeof codeToHtml>[1]['decorations'];

export async function highlightCode(
  code: string,
  lang: string,
  theme: string,
  decorations?: Decorations
): Promise<string> {
  return codeToHtml(code, {
    lang,
    theme,
    decorations,
  });
}
