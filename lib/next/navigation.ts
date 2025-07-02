import {
  useLocation,
  useParams as useRRUseParams,
  useSearchParams as useRRUseSearchParams,
  useNavigate,
} from 'react-router';

export function usePathname(): string {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useRRUseSearchParams();
}

export function useParams() {
  return useRRUseParams();
}

export function useRouter() {
  const push = useNavigate();
  return { push, replace: (href: string) => push(href, { replace: true }) };
}
