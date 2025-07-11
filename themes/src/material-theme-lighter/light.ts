import type { Theme } from '../../type';

const materialThemeLighterLight: Theme = {
  id: 'material-theme-lighter-light',
  name: 'Material Theme Lighter (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fafafa',
    '--background-1': '#f5f5f5',
    '--background-2': '#eeeeee',
    '--border': '#e0e0e0',
    '--border-1': '#bdbdbd',
    '--border-2': '#b2ccd6',
    '--foreground': '#263238',
    '--foreground-1': '#546e7a',
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
  shiki: 'material-theme-lighter',
};

export default materialThemeLighterLight;
