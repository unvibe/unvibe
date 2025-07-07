// Ayu Dark Theme
import { Theme } from '../../type';

const ayuDark: Theme = {
  name: 'Ayu Dark',
  id: 'ayu-dark',
  colorScheme: 'dark',
  cssVariables: {
    '--background': '#0A0E14',
    '--background-1': '#181C22',
    '--background-2': '#141820',
    '--border': '#151A1E',
    '--border-1': '#20262C',
    '--border-2': '#282D34',
    '--foreground': '#B3B1AD',
    '--foreground-1': '#787B80',
    '--foreground-2': '#5C6773',
    '--accent': '#FFB454',
    '--accent-2': '#39BAE6',
    '--font-code': '"Source Code Pro", "Courier New", Courier, monospace',
    '--font-ui': 'system-ui, sans-serif',
  },
  meta: [],
  shiki: 'ayu-dark',
};

export default ayuDark;
