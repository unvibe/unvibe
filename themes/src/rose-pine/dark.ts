import type { Theme } from '../../type';

const rosePineDark: Theme = {
  id: 'rose-pine-dark',
  name: 'Rosé Pine (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#191724',
    '--background-1': '#232136',
    '--background-2': '#2a273f',
    '--border': '#393552',
    '--border-1': '#6e6a86',
    '--border-2': '#eb6f92',
    '--foreground': '#e0def4',
    '--foreground-1': '#c4a7e7',
    '--foreground-2': '#ebbcba',
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
  shiki: 'rose-pine',
};

export default rosePineDark;
