import type { Theme } from '../../type';

const catppuccinMacchiatoDark: Theme = {
  id: 'catppuccin-macchiato-dark',
  name: 'Catppuccin Macchiato (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#24273a',
    '--background-1': '#1e2030',
    '--background-2': '#181926',
    '--border': '#363a4f',
    '--border-1': '#494d64',
    '--border-2': '#f4dbd6',
    '--foreground': '#cad3f5',
    '--foreground-1': '#a5adcb',
    '--foreground-2': '#f4dbd6',
    '--accent': '#ed8796',
    '--accent-2': '#8aadf4',
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
  shiki: 'catppuccin-macchiato',
};

export default catppuccinMacchiatoDark;
