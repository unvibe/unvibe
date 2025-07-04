import { Theme } from '~/themes/type';

export default {
  id: 'unvibe-light',
  name: 'Unvibe Light',
  colorScheme: 'light',
  shiki: 'github-light',
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
    '--background': '#ffffff',
    '--background-1': '#f9f9f9',
    '--background-2': '#f0f0f0',
    '--border': '#e0e0e0',
    '--border-1': '#d0d0d0',
    '--border-2': '#c0c0c0',
    '--foreground': '#171717',
    '--foreground-1': '#333',
    '--foreground-2': '#555',
    '--font-code': '"Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': '"Prompt", Arial, Helvetica, sans-serif',
  },
} as Theme;
