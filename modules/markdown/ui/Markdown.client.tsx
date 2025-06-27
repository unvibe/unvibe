import { MarkdownNode } from './markdown.common';
import { parseMarkdown } from '../library/parser';
import { useEffect, useState } from 'react';
import { noop } from '@/lib/core/noop';

export function Markdown({
  text,
  initialHTML = '',
}: {
  text: string;
  initialHTML: string;
}) {
  const [html, setHtml] = useState(initialHTML);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );

  noop(status);

  useEffect(() => {
    setStatus('loading');

    Promise.resolve(parseMarkdown(text))
      .then((htmlText) => {
        setStatus('success');
        setHtml(htmlText);
      })
      .catch((error) => {
        setStatus('error');
        console.log('error parsing markdown', error);
      });
  }, [text]);

  return <MarkdownNode html={html} />;
}
