import { createClient } from '@/server/api/client/create';
import { baseURL } from '@/server/api/constants';
import { HiCheckCircle, HiXMark } from 'react-icons/hi2';
import { TiChevronRight, TiFolder } from 'react-icons/ti';

const envKeys: (
  | { type: 'key'; key: string; allows: string; set: boolean }
  | {
      type: 'group';
      key: string;
      allows: string;
      keys: { key: string; set: boolean }[];
    }
)[] = [
  {
    type: 'key',
    key: 'OPENAI_API_KEY',
    allows: 'OpenAI models',
    set: !!import.meta.env.OPENAI_API_KEY,
  },
  {
    type: 'key',
    key: 'GOOGLE_API_KEY',
    allows: 'Google models',
    set: !!import.meta.env.GOOGLE_API_KEY,
  },
  {
    type: 'key',
    key: 'ANTHROPIC_API_KEY',
    allows: 'Anthropic models',
    set: !!import.meta.env.ANTHROPIC_API_KEY,
  },
  {
    type: 'group',
    key: 'aws',
    allows: 'Models images',
    keys: [
      { key: 'AWS_ACCESS_KEY_ID', set: !!import.meta.env.AWS_ACCESS_KEY_ID },
      {
        key: 'AWS_ACCESS_SECRET_KEY',
        set: !!import.meta.env.AWS_ACCESS_SECRET_KEY,
      },
      { key: 'AWS_S3_BUCKET', set: !!import.meta.env.AWS_S3_BUCKET },
      { key: 'AWS_S3_REGION', set: !!import.meta.env.AWS_S3_REGION },
      {
        key: 'AWS_CLOUDFRONT_CDN_URL',
        set: !!import.meta.env.AWS_CLOUDFRONT_CDN_URL,
      },
    ],
  },
];

export function WelcomeMessage({ recent }: { recent: string[] }) {
  return (
    <div className='relative max-w-7xl mx-auto p-6 bg-background-1 rounded-3xl border border-border-2 pt-12'>
      <div className='absolute top-0 right-0 p-6'>
        <button className='p-1 rounded-full bg-background-2 hover:bg-background-3 transition-colors'>
          <HiXMark className='w-6 h-6' />
        </button>
      </div>
      <h1 className='text-4xl font-semibold mb-4'>Welcome Message</h1>
      <p className='text-lg text-foreground-1 mb-4 py-2'>
        Unvibe is an open-source web application that runs locally in your
        browser, it has access to your local files and terminal to enable AI
        workflows that interacts with your local environment.
      </p>
      <h3 className='text-2xl font-semibold mb-2'>1. Setup Your Environment</h3>
      <div className='flex items-stretch gap-1 flex-wrap [&>*]:flex-1 mb-6'>
        {envKeys.map((env) => {
          if (env.type === 'key') {
            return (
              <div
                key={env.key}
                className='font-mono text-sm flex items-start gap-2 p-3 rounded-2xl bg-background-2'
              >
                {env.set ? (
                  <HiCheckCircle className='w-6 h-6 text-emerald-600' />
                ) : (
                  <span className='w-5 h-5 rounded-full' />
                )}
                <div className='grid content-start h-full'>
                  <div>{env.key}</div>
                  <div className='text-foreground-2'>Enables {env.allows}</div>
                </div>
              </div>
            );
          } else if (env.type === 'group') {
            return (
              <div
                key={env.key}
                className='font-mono text-sm bg-background-2 p-3 rounded-2xl'
              >
                <div className='flex items-start gap-2'>
                  {env.keys.every((key) => key.set) ? (
                    <HiCheckCircle className='w-6 h-6 text-emerald-600' />
                  ) : (
                    <span className='w-5 h-5 rounded-full' />
                  )}
                  <div className='grid content-start h-full'>
                    <div className='font-semibold'>Group:{env.key}</div>
                    <div className='text-foreground-2'>
                      Enables {env.allows}
                    </div>
                  </div>
                </div>
                <div className='pl-4 hidden'>
                  {env.keys.map((key) => (
                    <div
                      key={key.key}
                      className='font-mono text-sm flex items-center gap-2'
                    >
                      {key.set ? (
                        <HiCheckCircle className='w-6 h-6 text-emerald-600' />
                      ) : (
                        <span className='w-5 h-5 rounded-full' />
                      )}
                      <div>{key.key}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      <h3 className='text-2xl font-semibold mb-2'>
        2. Make It Your Own (very important)
      </h3>
      <div className='flex gap-4'>
        <div className='grid text-center'>
          <div className='h-[150px] w-[150px] bg-background-2 rounded-3xl'></div>
          <div>Unvibe/Dark</div>
        </div>
        <div className='grid text-center'>
          <div className='h-[150px] w-[150px] bg-background-2 rounded-3xl'></div>
          <div>Unvibe/Light</div>
        </div>
        <div className='grid text-center'>
          <div className='h-[150px] w-[150px] bg-background-2 rounded-3xl'></div>
          <div>NEW ++</div>
        </div>
      </div>
      <h3 className='text-2xl font-semibold mb-2 pt-8'>
        3. Select a Project and Start Building!
      </h3>
      <p className='py-4'>
        🎉 Now everything is ready, select a project and start building!
      </p>
      <p className='font-semibold mb-2'>
        Recently Edited Projects{' '}
        <span className='text-sm font-normal'>
          (<span className='text-blue-400 px-0.5 underline'>view all</span>)
        </span>
      </p>
      <div className='flex gap-2 flex-wrap'>
        {recent.map((folderName) => {
          return (
            <div key={folderName} className='bg-background-2 p-3 rounded-2xl'>
              <div className='flex items-center gap-2 mb-1'>
                <TiFolder className='w-6 h-6' />
                <span className='text-sm font-mono'>{folderName}</span>
                <TiChevronRight className='w-4 h-4 text-foreground-2' />
              </div>
            </div>
          );
        })}
        <div className='bg-background-2 p-3 rounded-2xl'>
          <div className='flex items-center gap-2 mb-1'>
            <TiFolder className='w-6 h-6' />
            <span className='text-sm font-mono'>NEW ++</span>
            <TiChevronRight className='w-4 h-4 text-foreground-2' />
          </div>
        </div>
      </div>
    </div>
  );
}
