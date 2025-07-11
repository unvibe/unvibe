import type { Theme } from '../../type';

const materialThemeOceanDark: Theme = {
  id: 'material-theme-ocean-dark',
  name: 'Material Theme Ocean (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#263238',
    '--background-1': '#2e3c43',
    '--background-2': '#314549',
    '--border': '#3c474d',
    '--border-1': '#546e7a',
    '--border-2': '#89ddff',
    '--foreground': '#eeffff',
    '--foreground-1': '#b2ccd6',
    '--foreground-2': '#c3e88d',
    '--accent': '#82aaff',
    '--accent-2': '#c792ea',
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
  shiki: 'material-theme-ocean',
};

export default materialThemeOceanDark;
