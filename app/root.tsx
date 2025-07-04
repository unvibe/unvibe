import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { Provider } from '@/modules/root-providers';
import { Toaster } from '@/modules/ui/notification';
import clsx from 'clsx';
import { themes } from './themes/registery';
import defaultTheme from '@/app/themes/src/unvibe/dark/meta';
import cookie from 'cookie';

export const links: Route.LinksFunction = () => [];

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const parsed = cookie.parse(cookieHeader || '');
  const selectedTheme = parsed.theme || 'unvibe-dark';
  return {
    theme: themes.find((theme) => theme.id == selectedTheme) || defaultTheme,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useLoaderData<typeof loader>();
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className={clsx('box-border', 'font-display')}>
        <Provider theme={theme}>
          {children}
          <Toaster />
        </Provider>
        <ScrollRestoration />
        <Scripts />
        <script>
          {`
          const node = document.getElementById('thread-details-message-list')
          node.scrollTop = node.scrollHeight;
          `}
        </script>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
