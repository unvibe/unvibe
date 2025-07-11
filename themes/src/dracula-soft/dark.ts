import type { Theme } from '../../type';

const draculaSoftDark: Theme = {
  id: 'dracula-soft-dark',
  name: 'Dracula Soft (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#22212c',
    '--background-1': '#2a2937',
    '--background-2': '#353446',
    '--border': '#44475a',
    '--border-1': '#6272a4',
    '--border-2': '#bd93f9',
    '--foreground': '#f8f8f2',
    '--foreground-1': '#bd93f9',
    '--foreground-2': '#ffb86c',
    '--accent': '#8be9fd',
    '--accent-2': '#ff79c6',
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
  shiki: 'dracula-soft',
};

export default draculaSoftDark;
