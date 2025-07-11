import type { Theme } from '../../type';

const redDark: Theme = {
  id: 'red-dark',
  name: 'Red (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#2e1a1b',
    '--background-1': '#3c2323',
    '--background-2': '#4d2626',
    '--border': '#91231c',
    '--border-1': '#b22c2c',
    '--border-2': '#e06c75',
    '--foreground': '#f2e7e7',
    '--foreground-1': '#fb6161',
    '--foreground-2': '#e06c75',
    '--accent': '#e06c75',
    '--accent-2': '#fb6161',
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
  shiki: 'red',
};

export default redDark;
