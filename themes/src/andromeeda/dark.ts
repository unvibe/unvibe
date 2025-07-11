import type { Theme } from '../../type';

const andromeedaDark: Theme = {
  id: 'andromeeda-dark',
  name: 'Andromeeda (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#262335',
    '--background-1': '#302b4e',
    '--background-2': '#373063',
    '--border': '#38304a',
    '--border-1': '#574e7e',
    '--border-2': '#9b78fa',
    '--foreground': '#f8f8f2',
    '--foreground-1': '#cfbafa',
    '--foreground-2': '#9b78fa',
    '--accent': '#f09383',
    '--accent-2': '#9b78fa',
    '--font-code': '"Fira Mono", Menlo, Monaco, Consolas, monospace',
    '--font-ui': 'system-ui, sans-serif',
  },
  meta: [
    { type: 'link', rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      type: 'link',
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      type: 'link',
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap',
    },
  ],
  shiki: 'andromeeda',
};

export default andromeedaDark;
