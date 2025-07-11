import type { Theme } from '../../type';

const poimandresDark: Theme = {
  id: 'poimandres-dark',
  name: 'Poimandres (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1b1e28',
    '--background-1': '#282c34',
    '--background-2': '#353a47',
    '--border': '#44475a',
    '--border-1': '#a6accd',
    '--border-2': '#89ddff',
    '--foreground': '#e0def4',
    '--foreground-1': '#89ddff',
    '--foreground-2': '#a6e3a1',
    '--accent': '#ffb86c',
    '--accent-2': '#c792ea',
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
  shiki: 'poimandres',
};

export default poimandresDark;
