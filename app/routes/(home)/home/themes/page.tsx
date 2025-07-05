import { HomeSectionSharedHeader } from '@/modules/home/home-section-shared-header';
import { HomeSectionSharedLayout } from '@/modules/home/home-section-shared-layout';
import { Markdown } from '@/modules/markdown/ui/Markdown';
import { ThemeProvider, useTheme } from '@/modules/root-providers/theme';
import { Button } from '@/modules/ui';
import { HiCheckCircle, HiPlus } from 'react-icons/hi2';
import { TiBrush } from 'react-icons/ti';
import { themes } from '@/themes/registery';
import * as React from 'react';

const snippet = `\`\`\`tsx
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Increment {count}
    </Button>
  );
}
\`\`\`
`;

export default function ThemesPage() {
  const [currentTheme, setCurrentTheme] = useTheme();
  const [filter, setFilter] = React.useState<'all' | 'light' | 'dark'>('dark');
  const [visibleThemes, setVisibleThemes] = React.useState(themes);

  // Filter themes based on the selected color scheme
  const filteredThemes =
    filter === 'all'
      ? visibleThemes
      : visibleThemes.filter((theme) => theme.colorScheme === filter);

  React.useEffect(() => {
    setVisibleThemes(themes);
  }, []);

  return (
    <HomeSectionSharedLayout>
      <HomeSectionSharedHeader
        Icon={TiBrush}
        sectionName='Themes'
        sectionDescription='Themes allow you to customize the appearance of Unvibe. You can create, edit, and delete themes from this page.'
        buttons={
          <>
            <Button
              variant='secondary'
              className='flex items-center justify-center p-2!'
              title='Add Project'
            >
              <HiPlus className='w-6 h-6' />
            </Button>
          </>
        }
        values={visibleThemes}
        setValues={setVisibleThemes}
        allValues={themes}
        getSearchString={(theme) => theme.name}
      />
      <div className='flex pb-4'>
        <div className='flex rounded-xl bg-background-1 overflow-hidden border border-border'>
          {[
            { label: 'All', value: 'all' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as 'all' | 'light' | 'dark')}
              className={`px-4 py-2 font-mono transition-colors focus:outline-none
              ${filter === item.value ? 'bg-background-2 text-foreground font-bold' : 'bg-transparent text-foreground-2'}
              first:rounded-l-xl last:rounded-r-xl`}
              type='button'
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className='grid grid-cols-2 2xl:grid-cols-3 gap-4'>
        {filteredThemes.map((theme) => (
          <ThemeProvider key={theme.name} theme={theme}>
            <button
              className='rounded-3xl text-left bg-background-2 flex gap-3 flex-col w-full font-mono cursor-pointer p-5 relative'
              style={theme.cssVariables}
              onClick={() => setCurrentTheme(theme)}
            >
              <div className='absolute top-5 right-5 bg-background w-8 h-8 rounded-full'>
                {currentTheme.name === theme.name ? (
                  <HiCheckCircle className='w-8 h-8 text-foreground-2' />
                ) : (
                  <div className='bg-background w-8 h-8 rounded-full' />
                )}
              </div>
              <div className='text-foreground'>{theme.name}</div>
              <div className='flex'>
                <div className='flex items-center gap-[2px] bg-gradient-to-r'>
                  {Object.keys(theme.cssVariables)
                    .filter(
                      (key) =>
                        key.startsWith('--background') ||
                        key.startsWith('--foreground') ||
                        key.startsWith('--border')
                    )
                    .map((key) => (
                      <span
                        key={key}
                        style={{ backgroundColor: `var(${key})` }}
                        className='w-5 h-5 rounded-lg border border-border not-first:-ms-2'
                      />
                    ))}
                </div>
              </div>
              <Markdown text={snippet} />
            </button>
          </ThemeProvider>
        ))}
      </div>
    </HomeSectionSharedLayout>
  );
}
