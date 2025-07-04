import { Theme } from './type';

export function ThemeMetaTags({ theme }: { theme: Theme }) {
  return (
    <>
      {theme.meta.map((item, index) => {
        if (item.type === 'link') {
          return (
            <link
              className={`__${theme.id}_meta`}
              key={index}
              rel={item.rel}
              href={item.href}
              crossOrigin={item.crossOrigin as undefined}
            />
          );
        }
        if (item.type === 'meta') {
          return (
            <meta key={index} className={`__${theme.id}_meta`} {...item} />
          );
        }
        return null;
      })}
      <style id={`__${theme.id}_root_style`}>{`
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
