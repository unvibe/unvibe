import type { Theme } from '../../type';

const plasticDark: Theme = {
  id: 'plastic-dark',
  name: 'Plastic (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#262b3c',
    '--background-1': '#2e3448',
    '--background-2': '#393e4f',
    '--border': '#4d536b',
    '--border-1': '#5a6373',
    '--border-2': '#f6c177',
    '--foreground': '#e0def4',
    '--foreground-1': '#b7bdf8',
    '--foreground-2': '#f6c177',
    '--accent': '#eb6f92',
    '--accent-2': '#ea9a97',
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
  shiki: 'plastic',
};

export default plasticDark;
