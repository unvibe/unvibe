import type { Theme } from '../../type';

const solarizedDark: Theme = {
  id: 'solarized-dark',
  name: 'Solarized Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#002b36',
    '--background-1': '#073642',
    '--background-2': '#586e75',
    '--border': '#657b83',
    '--border-1': '#839496',
    '--border-2': '#b58900',
    '--foreground': '#839496',
    '--foreground-1': '#93a1a1',
    '--foreground-2': '#b58900',
    '--accent': '#cb4b16',
    '--accent-2': '#268bd2',
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
  shiki: 'solarized-dark',
};

export default solarizedDark;
