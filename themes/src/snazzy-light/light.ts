import type { Theme } from '../../type';

const snazzyLight: Theme = {
  id: 'snazzy-light',
  name: 'Snazzy Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fafafa',
    '--background-1': '#f4f4f4',
    '--background-2': '#ededed',
    '--border': '#dddddd',
    '--border-1': '#bbbbbb',
    '--border-2': '#ff5c57',
    '--foreground': '#282a36',
    '--foreground-1': '#44475a',
    '--foreground-2': '#50fa7b',
    '--accent': '#ff5c57',
    '--accent-2': '#57c7ff',
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
  shiki: 'snazzy-light',
};

export default snazzyLight;
