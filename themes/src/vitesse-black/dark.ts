import type { Theme } from '../../type';

const vitesseBlackDark: Theme = {
  id: 'vitesse-black-dark',
  name: 'Vitesse Black (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#181818',
    '--background-1': '#222222',
    '--background-2': '#2d2d2d',
    '--border': '#343434',
    '--border-1': '#565656',
    '--border-2': '#ffcc00',
    '--foreground': '#eaeaea',
    '--foreground-1': '#bdbdbd',
    '--foreground-2': '#ffcc00',
    '--accent': '#ffcc00',
    '--accent-2': '#00cfff',
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
  shiki: 'vitesse-black',
};

export default vitesseBlackDark;
