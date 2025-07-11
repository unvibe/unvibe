import type { Theme } from '../../type';

const minDark: Theme = {
  id: 'min-dark',
  name: 'Min Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#292929',
    '--background-1': '#222222',
    '--background-2': '#333333',
    '--border': '#444444',
    '--border-1': '#555555',
    '--border-2': '#888888',
    '--foreground': '#f2f2f2',
    '--foreground-1': '#cccccc',
    '--foreground-2': '#888888',
    '--accent': '#ff8c00',
    '--accent-2': '#ff5e5e',
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
  shiki: 'min-dark',
};

export default minDark;
