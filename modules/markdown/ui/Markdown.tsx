import { MarkdownNode } from './markdown.common';
import { parseMarkdown, parseMarkdownSync } from '../library/parser';
import { useTheme } from '@/modules/root-providers/theme';
import { useEffect, useState } from 'react';

export function Markdown({ text }: { text: string }) {
  const [theme] = useTheme();
  const [html, setHtml] = useState(() => parseMarkdownSync(text, theme.shiki));

  useEffect(() => {
    parseMarkdown(text, theme.shiki).then((parsedHtml) => {
      setHtml(parsedHtml);
    });
  }, [text, theme.shiki]);
  return <MarkdownNode html={html} />;
}
