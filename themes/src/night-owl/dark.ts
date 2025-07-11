import type { Theme } from '../../type';

const nightOwlDark: Theme = {
  id: 'night-owl-dark',
  name: 'Night Owl (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#011627',
    '--background-1': '#1d3b53',
    '--background-2': '#152c4a',
    '--border': '#5f7e97',
    '--border-1': '#82aaff',
    '--border-2': '#7fdbca',
    '--foreground': '#d6deeb',
    '--foreground-1': '#a7bfe8',
    '--foreground-2': '#7fdbca',
    '--accent': '#c792ea',
    '--accent-2': '#ecc48d',
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
  shiki: 'night-owl',
};

export default nightOwlDark;
