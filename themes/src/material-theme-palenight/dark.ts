import type { Theme } from '../../type';

const materialThemePalenightDark: Theme = {
  id: 'material-theme-palenight-dark',
  name: 'Material Theme Palenight (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#292d3e',
    '--background-1': '#313244',
    '--background-2': '#394867',
    '--border': '#444267',
    '--border-1': '#bfc7d5',
    '--border-2': '#c792ea',
    '--foreground': '#a6accd',
    '--foreground-1': '#c3e88d',
    '--foreground-2': '#80cbc4',
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
  shiki: 'material-theme-palenight',
};

export default materialThemePalenightDark;
