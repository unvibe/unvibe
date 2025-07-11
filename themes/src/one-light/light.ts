import type { Theme } from '../../type';

const oneLight: Theme = {
  id: 'one-light',
  name: 'One Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fafafa',
    '--background-1': '#f3f4f5',
    '--background-2': '#e8e9ed',
    '--border': '#e6e6e6',
    '--border-1': '#d2d4de',
    '--border-2': '#c8c9ce',
    '--foreground': '#5c6773',
    '--foreground-1': '#8794a4',
    '--foreground-2': '#abb0b6',
    '--accent': '#f29718',
    '--accent-2': '#55b4d4',
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
  shiki: 'one-light',
};

export default oneLight;
