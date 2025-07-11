import type { Theme } from '../../type';

const gruvboxLightHard: Theme = {
  id: 'gruvbox-light-hard',
  name: 'Gruvbox Light Hard (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#f9f5d7',
    '--background-1': '#fbf1c7',
    '--background-2': '#f2e5bc',
    '--border': '#ebdbb2',
    '--border-1': '#d5c4a1',
    '--border-2': '#bdae93',
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
  shiki: 'gruvbox-light-hard',
};

export default gruvboxLightHard;
