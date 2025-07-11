import type { Theme } from '../../type';

const auroraXDark: Theme = {
  id: 'aurora-x-dark',
  name: 'Aurora X (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1b2229',
    '--background-1': '#232b34',
    '--background-2': '#28303a',
    '--border': '#2a323d',
    '--border-1': '#394150',
    '--border-2': '#8aff80',
    '--foreground': '#eaffff',
    '--foreground-1': '#a8ffeb',
    '--foreground-2': '#8aff80',
    '--accent': '#5ad4e6',
    '--accent-2': '#ffb86c',
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
  shiki: 'aurora-x',
};

export default auroraXDark;
