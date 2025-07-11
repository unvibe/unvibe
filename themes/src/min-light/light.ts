import type { Theme } from '../../type';

const minLight: Theme = {
  id: 'min-light',
  name: 'Min Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#ffffff',
    '--background-1': '#f8f8f8',
    '--background-2': '#eeeeee',
    '--border': '#cccccc',
    '--border-1': '#bbbbbb',
    '--border-2': '#888888',
    '--foreground': '#292929',
    '--foreground-1': '#444444',
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
  shiki: 'min-light',
};

export default minLight;
