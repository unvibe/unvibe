import type { Theme } from '../../type';

const tokyoNightDark: Theme = {
  id: 'tokyo-night-dark',
  name: 'Tokyo Night (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#1a1b26',
    '--background-1': '#24283b',
    '--background-2': '#414868',
    '--border': '#565f89',
    '--border-1': '#8aadf4',
    '--border-2': '#b4f9f8',
    '--foreground': '#c0caf5',
    '--foreground-1': '#a9b1d6',
    '--foreground-2': '#b4f9f8',
    '--accent': '#7aa2f7',
    '--accent-2': '#f7768e',
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
  shiki: 'tokyo-night',
};

export default tokyoNightDark;
