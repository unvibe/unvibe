import type { Theme } from '../../type';

const synthwave84Dark: Theme = {
  id: 'synthwave-84-dark',
  name: 'Synthwave 84 (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#2a2139',
    '--background-1': '#3a2d5d',
    '--background-2': '#4a397a',
    '--border': '#f7e8e8',
    '--border-1': '#e6e6e6',
    '--border-2': '#f356b0',
    '--foreground': '#f7f1ff',
    '--foreground-1': '#f356b0',
    '--foreground-2': '#ffe261',
    '--accent': '#f356b0',
    '--accent-2': '#ffe261',
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
  shiki: 'synthwave-84',
};

export default synthwave84Dark;
