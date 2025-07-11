import type { Theme } from '../../type';

const kanagawaLotusLight: Theme = {
  id: 'kanagawa-lotus-light',
  name: 'Kanagawa Lotus (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#f2ecbc',
    '--background-1': '#e6dfb8',
    '--background-2': '#c5c9ab',
    '--border': '#a6a69c',
    '--border-1': '#b7b29c',
    '--border-2': '#6a9589',
    '--foreground': '#5c6a72',
    '--foreground-1': '#6e738d',
    '--foreground-2': '#a7c080',
    '--accent': '#f4b8e4',
    '--accent-2': '#e67e80',
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
  shiki: 'kanagawa-lotus',
};

export default kanagawaLotusLight;
