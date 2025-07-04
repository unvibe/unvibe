import { Theme } from '~/themes/type';

export default {
  id: 'unvibe-dark',
  name: 'Unvibe Dark',
  colorScheme: 'dark',
  shiki: 'github-dark',
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
      href: 'https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap',
    },
  ],
  cssVariables: {
    '--background': '#181818',
    '--background-1': '#1c1c1c',
    '--background-2': '#2c2c2c',
    '--border': '#3a3a3a',
    '--border-1': '#303030',
    '--border-2': '#2a2a2a',
    '--foreground': '#d5d5d5',
    '--foreground-1': '#a4a4a4',
    '--foreground-2': '#8a8a8a',
    '--font-code': '"Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Prompt", Arial, Helvetica, sans-serif',
  },
} as Theme;
