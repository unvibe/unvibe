import type { Theme } from '../../type';

const catppuccinFrappeDark: Theme = {
  id: 'catppuccin-frappe-dark',
  name: 'Catppuccin Frappe (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#303446',
    '--background-1': '#292c3c',
    '--background-2': '#232634',
    '--border': '#414559',
    '--border-1': '#51576d',
    '--border-2': '#babbf1',
    '--foreground': '#c6d0f5',
    '--foreground-1': '#a5adce',
    '--foreground-2': '#babbf1',
    '--accent': '#f4b8e4',
    '--accent-2': '#ca9ee6',
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
  shiki: 'catppuccin-frappe',
};

export default catppuccinFrappeDark;
