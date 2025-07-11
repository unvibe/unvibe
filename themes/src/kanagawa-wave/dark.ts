import type { Theme } from '../../type';

const kanagawaWaveDark: Theme = {
  id: 'kanagawa-wave-dark',
  name: 'Kanagawa Wave (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1f1f28',
    '--background-1': '#223249',
    '--background-2': '#2a2a37',
    '--border': '#54546d',
    '--border-1': '#727169',
    '--border-2': '#c8c093',
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
  shiki: 'kanagawa-wave',
};

export default kanagawaWaveDark;
