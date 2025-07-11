import type { Theme } from '../../type';

const catppuccinMochaDark: Theme = {
  id: 'catppuccin-mocha-dark',
  name: 'Catppuccin Mocha (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1e1e2e',
    '--background-1': '#181825',
    '--background-2': '#11111b',
    '--border': '#313244',
    '--border-1': '#45475a',
    '--border-2': '#b4befe',
    '--foreground': '#cdd6f4',
    '--foreground-1': '#a6adc8',
    '--foreground-2': '#b4befe',
    '--accent': '#f38ba8',
    '--accent-2': '#a6e3a1',
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
  shiki: 'catppuccin-mocha',
};

export default catppuccinMochaDark;
