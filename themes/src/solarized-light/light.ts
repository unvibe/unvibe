import type { Theme } from '../../type';

const solarizedLight: Theme = {
  id: 'solarized-light',
  name: 'Solarized Light (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fdf6e3',
    '--background-1': '#eee8d5',
    '--background-2': '#93a1a1',
    '--border': '#839496',
    '--border-1': '#657b83',
    '--border-2': '#b58900',
    '--foreground': '#657b83',
    '--foreground-1': '#586e75',
    '--foreground-2': '#b58900',
    '--accent': '#268bd2',
    '--accent-2': '#cb4b16',
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
  shiki: 'solarized-light',
};

export default solarizedLight;
