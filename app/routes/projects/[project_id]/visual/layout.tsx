import { Route } from './+types/page';
import React from 'react';
import { ProjectVisualModeEntry } from '~/modules/project/visual/visual-mode-entrypoint';
import { Outlet, useOutletContext } from 'react-router';
import { LayoutContextProvider, useLayoutContext } from './layout-context';

function Layout({ children }: { children?: React.ReactNode }) {
  const { pathname, port, iframeRef, setPathname } = useLayoutContext();
  const src = `http://localhost:${port}${pathname}`;

  return (
    <div className='h-full w-full max-w-full max-h-full flex items-stretch'>
      <div className='w-full py-8 pr-4 grid content-between h-[100vh] overflow-y-auto overflow-x-hidden max-w-md relative'>
        {children}
      </div>
      <div className='w-full h-full overflow-hidden flex items-stretch border border-border'>
        {port ? (
          <ProjectVisualModeEntry
            ref={iframeRef}
            onReload={() => {
              if (iframeRef.current) {
                iframeRef.current.src = src;
              }
            }}
            src={src}
            onPathnameChange={(_pathname) => {
              setPathname(_pathname);
            }}
          />
        ) : (
          <div className='w-full h-full grid place-items-center text-foreground-2'>
            Enter the dev server port for your project to enable the preview.
          </div>
        )}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Page(_props: Route.ComponentProps) {
  const context = useOutletContext();
  return (
    <LayoutContextProvider>
      <Layout>
        <Outlet context={context} />
      </Layout>
    </LayoutContextProvider>
  );
}
