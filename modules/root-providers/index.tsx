import { Theme } from '~/themes/type';
import { ReactQueryProvider } from './react-query';
import { ThemeProvider } from './theme';

export function Provider({
  children,
  theme,
}: Readonly<{ children: React.ReactNode; theme: Theme }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ReactQueryProvider>
  );
}
