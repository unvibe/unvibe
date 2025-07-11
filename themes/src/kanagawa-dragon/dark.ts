import type { Theme } from '../../type';

const kanagawaDragonDark: Theme = {
  id: 'kanagawa-dragon-dark',
  name: 'Kanagawa Dragon (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#181616',
    '--background-1': '#1f1f28',
    '--background-2': '#223249',
    '--border': '#2a2a37',
    '--border-1': '#54546d',
    '--border-2': '#76946a',
    '--foreground': '#dcd7ba',
    '--foreground-1': '#c8c093',
    '--foreground-2': '#76946a',
    '--accent': '#ffa066',
    '--accent-2': '#ff5d62',
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
  shiki: 'kanagawa-dragon',
};

export default kanagawaDragonDark;
