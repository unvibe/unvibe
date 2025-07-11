import type { Theme } from '../../type';

const gruvboxDarkMedium: Theme = {
  id: 'gruvbox-dark-medium',
  name: 'Gruvbox Dark Medium (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#282828',
    '--background-1': '#32302f',
    '--background-2': '#504945',
    '--border': '#665c54',
    '--border-1': '#bdae93',
    '--border-2': '#a89984',
    '--foreground': '#ebdbb2',
    '--foreground-1': '#d5c4a1',
    '--foreground-2': '#b8bb26',
    '--accent': '#fe8019',
    '--accent-2': '#fabd2f',
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
  shiki: 'gruvbox-dark-medium',
};

export default gruvboxDarkMedium;
