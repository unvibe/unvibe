import type { Theme } from '../../type';

const darkPlusDark: Theme = {
  id: 'dark-plus-dark',
  name: 'Dark Plus (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1e1e1e',
    '--background-1': '#232323',
    '--background-2': '#282828',
    '--border': '#333333',
    '--border-1': '#444444',
    '--border-2': '#5c6370',
    '--foreground': '#d4d4d4',
    '--foreground-1': '#c8c8c8',
    '--foreground-2': '#b5cea8',
    '--accent': '#569cd6',
    '--accent-2': '#d7ba7d',
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
  shiki: 'dark-plus',
};

export default darkPlusDark;
