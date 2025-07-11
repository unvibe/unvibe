import type { Theme } from '../../type';

const materialThemeDarkerDark: Theme = {
  id: 'material-theme-darker-dark',
  name: 'Material Theme Darker (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#212121',
    '--background-1': '#282828',
    '--background-2': '#323232',
    '--border': '#424242',
    '--border-1': '#616161',
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
  shiki: 'material-theme-darker',
};

export default materialThemeDarkerDark;
