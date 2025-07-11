import type { Theme } from '../../type';

const vitesseDark: Theme = {
  id: 'vitesse-dark',
  name: 'Vitesse Dark (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#181818',
    '--background-1': '#232323',
    '--background-2': '#282828',
    '--border': '#343434',
    '--border-1': '#565656',
    '--border-2': '#00cfff',
    '--foreground': '#eaeaea',
    '--foreground-1': '#bdbdbd',
    '--foreground-2': '#ffcc00',
    '--accent': '#00cfff',
    '--accent-2': '#ffcc00',
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
  shiki: 'vitesse-dark',
};

export default vitesseDark;
