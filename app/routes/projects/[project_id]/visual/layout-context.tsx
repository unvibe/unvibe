import { useParams } from '@/lib/next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface LayoutContextProps {
  pathname: string;
  port: string;
  setPort: (port: string) => void;
  setPathname: (pathname: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export const LayoutContext = createContext<LayoutContextProps | undefined>(
  undefined
);

export function useLayoutContext(): LayoutContextProps {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}

export function LayoutContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pathname, setPathname] = useState<string>('/');
  const [port, setPort] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const project_id = useParams().project_id as string;

  useEffect(() => {
    // safely save and retrive port
    const savedPort = localStorage.getItem(`visual-port-${project_id}`);
    if (savedPort) {
      setPort(savedPort);
    }
  }, []);

  const value = useMemo(() => {
    return {
      pathname,
      setPathname,
      port,
      setPort,
      iframeRef,
    };
  }, [pathname, port, setPathname, setPort]);

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}
