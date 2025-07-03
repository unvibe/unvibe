import { useAPIQuery } from '@/server/api/client';
import { TiBrush } from 'react-icons/ti';

export default function ThemesPage() {
  const { data, isLoading, error } = useAPIQuery('GET /home/info');
  if (isLoading) return <div className='p-10'>Loading themes...</div>;
  if (error)
    return <div className='p-10 text-red-500'>Failed to load themes</div>;
  return (
    <div className='p-10'>
      <h1 className='text-3xl font-bold mb-6 flex items-center gap-4'>
        <TiBrush className='w-8 h-8' />
        Themes
      </h1>
      <div className='grid gap-2'>
        {data?.themes?.map((theme: { id: string; name: string }) => (
          <div
            key={theme.id}
            className='rounded-4xl bg-background-1 hover:bg-background-2 transition-colors px-10 py-8 flex flex-col items-center justify-center min-w-[180px] min-h-[120px] font-mono text-lg cursor-pointer w-full h-[220px]'
          >
            <span className='text-blue-500 font-bold'>{theme.name}</span>
            <span className='text-sm text-foreground-2'>{theme.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/*

* Draft Theme Implementation

* Location -> @/modules/themes/...

* Workflow Description:

- we make two default themes hardcoded in files (unvibe-light.ts and unvibe-dark.ts)
- these two will be populated from the app.css file and root.tsx for fonts etc.
- we should have a function called createTheme(config: ThemeConfig): Theme
- a theme should be stored in db
- an active theme should be stored in db

interface ThemeConfig {
  name: string; // name of the theme
  base: 'light' | 'dark'; // to be used for "color-scheme" meta tag
  fonts: {
    body: {
      type: 'local' | 'google'; // local or google font
      family: string; // e.g. 'Inter, sans-serif'
    }
    mono: {
      type: 'local' | 'google'; // local or google font
      family: string; // e.g. 'Fira Code, monospace'
    }
  }
  code_highlighter: {
    id: string; // shiki themes
  }
  ui_colors: {
    background: {
      0: string; // DEFAULT
      1: string; // MEDIUM
      2: string; // HIGH
    }
    forground: {
      1: string; // DEFAULT
      2: string; // MEDIUM
      3: string; // HIGH
    }
    border: {
      0: string; // DEFAULT
      1: string; // MEDIUM
      2: string; // HIGH
    }
  }
}

*/
