import { createContext, useContext } from 'react';
import { Theme } from '~/themes/type';

const themeContext = createContext<null | Theme>(null);

export function useTheme() {
  const theme = useContext(themeContext);
  return theme as Theme;
}

export function ThemeProvider({
  children,
  theme,
}: Readonly<{ children: React.ReactNode; theme: Theme }>) {
  return (
    <themeContext.Provider value={theme}>{children}</themeContext.Provider>
  );
}
