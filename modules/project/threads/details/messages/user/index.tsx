import clsx from 'clsx';
import { Markdown } from '@/modules/markdown/ui/Markdown.client';
import { ThreadDetailsMessageProps } from '../_shared-types';

export function ThreadDetailsMessageUser({ data }: ThreadDetailsMessageProps) {
  const parsedContent = data.content;
  const images = data.images_urls;
  return (
    <div className={clsx('flex w-full justify-end pe-4 text-foreground-2')}>
      <div
        className={clsx(
          'p-4 flex rounded-2xl max-w-[70%] overflow-hidden bg-background-1'
        )}
      >
        <div className={clsx('whitespace-pre-wrap')}>
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
      </div>
    </div>
  );
}
