import type { Theme } from '../../type';

const rosePineDawnLight: Theme = {
  id: 'rose-pine-dawn-light',
  name: 'Rosé Pine Dawn (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#faf4ed',
    '--background-1': '#fffaf3',
    '--background-2': '#f2e9de',
    '--border': '#dfdad9',
    '--border-1': '#b3b9b8',
    '--border-2': '#eb6f92',
    '--foreground': '#575279',
    '--foreground-1': '#907aa9',
    '--foreground-2': '#ea9a97',
    '--accent': '#eb6f92',
    '--accent-2': '#f6c177',
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
  shiki: 'rose-pine-dawn',
};

export default rosePineDawnLight;
