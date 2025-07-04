import { createContext, useContext, useMemo, useState } from 'react';
import { Theme } from '@/themes/type';
import Cookie from 'js-cookie';

type SetTheme = (theme: Theme) => void;
type ThemeContext = [Theme, SetTheme];
const themeContext = createContext<null | ThemeContext>(null);

export function useTheme() {
  const theme = useContext(themeContext);
  return theme as ThemeContext;
}

export function ThemeProvider({
  children,
  theme,
}: Readonly<{ children: React.ReactNode; theme: Theme }>) {
  const [_theme, setTheme] = useState(theme);

  const themeState = useMemo<[theme: Theme, setTheme: SetTheme]>(() => {
    return [
      _theme,
      (newTheme: Theme) => {
        setTheme(newTheme);
        Cookie.set('theme', newTheme.id, { expires: 3650 }); // 10 years
      },
    ];
  }, [_theme]);

  return (
    <themeContext.Provider value={themeState}>{children}</themeContext.Provider>
  );
}
