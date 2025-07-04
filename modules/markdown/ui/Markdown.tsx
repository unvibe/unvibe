import { MarkdownNode } from './markdown.common';
import { parseMarkdown } from '../library/parser';
import { useTheme } from '@/modules/root-providers/theme';
import { useEffect, useState } from 'react';

export function Markdown({ text }: { text: string; initialHTML: string }) {
  const theme = useTheme();
  const [html, setHtml] = useState('');

  useEffect(() => {
    parseMarkdown(text, theme.shiki).then((parsedHtml) => {
      setHtml(parsedHtml);
    });
  }, [text, theme.shiki]);
  return <MarkdownNode html={html} />;
}
