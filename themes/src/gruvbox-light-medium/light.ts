import type { Theme } from '../../type';

const gruvboxLightMedium: Theme = {
  id: 'gruvbox-light-medium',
  name: 'Gruvbox Light Medium (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#fbf1c7',
    '--background-1': '#f2e5bc',
    '--background-2': '#ebdbb2',
    '--border': '#d5c4a1',
    '--border-1': '#bdae93',
    '--border-2': '#665c54',
    '--foreground': '#3c3836',
    '--foreground-1': '#504945',
    '--foreground-2': '#b57614',
    '--accent': '#b57614',
    '--accent-2': '#d79921',
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
  shiki: 'gruvbox-light-medium',
};

export default gruvboxLightMedium;
