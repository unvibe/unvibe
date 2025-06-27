import { MarkdownNode } from './markdown.common';
import { parseMarkdown } from '../library/parser';

export async function Markdown({ text }: { text: string }) {
  const html = await parseMarkdown(text);

  return <MarkdownNode html={html} />;
}
