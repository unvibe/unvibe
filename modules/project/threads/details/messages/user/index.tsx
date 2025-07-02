import clsx from 'clsx';
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { ThreadDetailsMessageProps } from '../_shared-types';
import { HiOutlineDuplicate } from 'react-icons/hi';
import { copyToClipboard } from '@/lib/browser/copy-to-clipboard';
import { useState } from 'react';
import { toast } from '@/modules/ui/notification';

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      title={copied ? 'Copied!' : 'Copy message'}
      className='absolute top-2 right-2 bg-background-2 border border-border rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20'
      onClick={async (e) => {
        e.stopPropagation();
        await copyToClipboard(content);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 1200);
      }}
      style={{ lineHeight: 0 }}
    >
      <HiOutlineDuplicate className='w-5 h-5' />
    </button>
  );
}

export function ThreadDetailsMessageUser({ data }: ThreadDetailsMessageProps) {
  const parsedContent = data.content;
  const images = data.images_urls;
  return (
    <div className={clsx('flex w-full justify-end pe-4 text-foreground-2')}>
      <div
        className={clsx(
          'p-4 flex rounded-2xl max-w-[70%] overflow-hidden bg-background-1 group relative'
        )}
      >
        <div className={clsx('whitespace-pre-wrap relative')}>
          {images && images.length > 0 && (
            <div className='flex gap-2'>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className='max-w-full h-20 w-20 rounded-2xl ring-2'
                />
              ))}
            </div>
          )}
          <Markdown
            initialHTML={parsedContent || ''}
            text={parsedContent || ''}
          />
        </div>
        {!!parsedContent && <CopyButton content={parsedContent} />}
      </div>
    </div>
  );
}
