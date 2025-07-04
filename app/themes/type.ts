export type Theme = {
  name: string;
  id: string;
  colorScheme: 'light' | 'dark';
  cssVariables: Record<string, string>;
  meta: (
    | {
        type: 'link';
        rel: string;
        href: string;
        crossOrigin?: string;
      }
    | {
        type: 'meta';
        name: string;
        content: string;
      }
  )[];
  shiki: string;
};
