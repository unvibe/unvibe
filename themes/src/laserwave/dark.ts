import type { Theme } from '../../type';

const laserwaveDark: Theme = {
  id: 'laserwave-dark',
  name: 'Laserwave (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#27212e',
    '--background-1': '#36304a',
    '--background-2': '#3b3355',
    '--border': '#6c5b7b',
    '--border-1': '#c86fc9',
    '--border-2': '#ea00d9',
    '--foreground': '#f8f8f2',
    '--foreground-1': '#cbe3e7',
    '--foreground-2': '#f300c9',
    '--accent': '#ff6c6b',
    '--accent-2': '#f3f99d',
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
  shiki: 'laserwave',
};

export default laserwaveDark;
