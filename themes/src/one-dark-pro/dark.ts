import type { Theme } from '../../type';

const oneDarkPro: Theme = {
  id: 'one-dark-pro',
  name: 'One Dark Pro (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#282c34',
    '--background-1': '#21252b',
    '--background-2': '#2c313c',
    '--border': '#3a3f4b',
    '--border-1': '#545862',
    '--border-2': '#61afef',
    '--foreground': '#abb2bf',
    '--foreground-1': '#e06c75',
    '--foreground-2': '#98c379',
    '--accent': '#c678dd',
    '--accent-2': '#e5c07b',
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
  shiki: 'one-dark-pro',
};

export default oneDarkPro;
