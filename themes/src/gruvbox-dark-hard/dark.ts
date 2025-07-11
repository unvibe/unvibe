import type { Theme } from '../../type';

const gruvboxDarkHard: Theme = {
  id: 'gruvbox-dark-hard',
  name: 'Gruvbox Dark Hard (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1d2021',
    '--background-1': '#282828',
    '--background-2': '#32302f',
    '--border': '#504945',
    '--border-1': '#665c54',
    '--border-2': '#bdae93',
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
  shiki: 'gruvbox-dark-hard',
};

export default gruvboxDarkHard;
