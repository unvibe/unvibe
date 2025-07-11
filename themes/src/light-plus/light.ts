import type { Theme } from '../../type';

const lightPlusLight: Theme = {
  id: 'light-plus-light',
  name: 'Light Plus (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#ffffff',
    '--background-1': '#f3f3f3',
    '--background-2': '#e7e7e7',
    '--border': '#cccccc',
    '--border-1': '#d7ba7d',
    '--border-2': '#b5cea8',
    '--foreground': '#333333',
    '--foreground-1': '#2a2a2a',
    '--foreground-2': '#0451a5',
    '--accent': '#007acc',
    '--accent-2': '#0451a5',
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
  shiki: 'light-plus',
};

export default lightPlusLight;
