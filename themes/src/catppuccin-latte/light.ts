import type { Theme } from '../../type';

const catppuccinLatteLight: Theme = {
  id: 'catppuccin-latte-light',
  name: 'Catppuccin Latte (Shiki)',
  colorScheme: 'light',
  cssVariables: {
    '--background': '#eff1f5',
    '--background-1': '#e6e9ef',
    '--background-2': '#dce0e8',
    '--border': '#bcc0cc',
    '--border-1': '#ccd0da',
    '--border-2': '#acb0be',
    '--foreground': '#4c4f69',
    '--foreground-1': '#5c5f77',
    '--foreground-2': '#6c6f85',
    '--accent': '#dc8a78',
    '--accent-2': '#7287fd',
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
  shiki: 'catppuccin-latte',
};

export default catppuccinLatteLight;
