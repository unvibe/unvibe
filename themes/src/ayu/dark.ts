import type { Theme } from '../../type';

const ayuDark: Theme = {
  id: 'ayu-dark',
  name: 'Ayu Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#0f1419',
    '--background-1': '#14191f',
    '--background-2': '#1a1f26',
    '--border': '#232834',
    '--border-1': '#273747',
    '--border-2': '#5c6773',
    '--foreground': '#e6e1cf',
    '--foreground-1': '#d9d7ce',
    '--foreground-2': '#5c6773',
    '--accent': '#ffb454',
    '--accent-2': '#95e6cb',
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
  shiki: 'ayu-dark',
};

export default ayuDark;
