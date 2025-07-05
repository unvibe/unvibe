import { useTheme } from '~/modules/root-providers/theme';
import { Outlet } from 'react-router';
import { ThemeMetaTags } from '@/themes/meta';

export default function Layout() {
  const [theme] = useTheme();
  return (
    <>
      <ThemeMetaTags theme={theme} />
      <Outlet />
    </>
  );
}
