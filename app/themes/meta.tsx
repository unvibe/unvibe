import { Theme } from './type';

export function ThemeMetaTags({ theme }: { theme: Theme }) {
  return (
    <>
      {theme.meta.map((item, index) => {
        if (item.type === 'link') {
          return (
            <link
              key={index}
              rel={item.rel}
              href={item.href}
              crossOrigin={item.crossOrigin as undefined}
            />
          );
        }
        if (item.type === 'meta') {
          return <meta key={index} {...item} />;
        }
        return null;
      })}
      <style>{`
          :root {
            color-scheme: ${theme.colorScheme};
            ${Object.entries(theme.cssVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n')}
          }
        `}</style>
    </>
  );
}
