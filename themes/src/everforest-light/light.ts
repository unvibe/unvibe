import type { Theme } from '../../type';

const everforestLight: Theme = {
  id: 'everforest-light',
  name: 'Everforest Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fdf6e3',
    '--background-1': '#f8f0dc',
    '--background-2': '#ece3cc',
    '--border': '#d8caac',
    '--border-1': '#a89c8e',
    '--border-2': '#c5c9ab',
    '--foreground': '#5c6a72',
    '--foreground-1': '#6e738d',
    '--foreground-2': '#a7c080',
    '--accent': '#dbbc7f',
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
  shiki: 'everforest-light',
};

export default everforestLight;
