import { ReactQueryProvider } from './react-query';

export function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
