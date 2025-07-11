import type { Theme } from '../../type';

const monokaiDark: Theme = {
  id: 'monokai-dark',
  name: 'Monokai (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#272822',
    '--background-1': '#2d2d2d',
    '--background-2': '#3e3d32',
    '--border': '#75715e',
    '--border-1': '#f8f8f2',
    '--border-2': '#f92672',
    '--foreground': '#f8f8f2',
    '--foreground-1': '#a6e22e',
    '--foreground-2': '#fd971f',
    '--accent': '#fd5ff1',
    '--accent-2': '#66d9ef',
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
  shiki: 'monokai',
};

export default monokaiDark;
