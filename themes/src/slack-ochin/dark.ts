import type { Theme } from '../../type';

const slackOchinDark: Theme = {
  id: 'slack-ochin-dark',
  name: 'Slack Ochin (Shiki)',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#19171c',
    '--background-1': '#221f29',
    '--background-2': '#28233a',
    '--border': '#393552',
    '--border-1': '#6e6a86',
    '--border-2': '#f6c177',
    '--foreground': '#e0def4',
    '--foreground-1': '#c4a7e7',
    '--foreground-2': '#ebbcba',
    '--accent': '#f6c177',
    '--accent-2': '#eb6f92',
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
  shiki: 'slack-ochin',
};

export default slackOchinDark;
