import { MarkdownNode } from './markdown.common';
import { parseMarkdown } from '../library/parser';

export function Markdown({ text }: { text: string; initialHTML: string }) {
  return <MarkdownNode html={parseMarkdown(text)} />;
}
