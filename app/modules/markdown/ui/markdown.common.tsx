export function MarkdownNode({ html }: { html: string }) {
  return (
    <div
      className='markdown-body grid gap-2 content-start overflow-hidden break-words'
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
