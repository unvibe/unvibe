import { useEffect, RefObject } from 'react';

/**
 * useClickOutside
 * Calls handler if a mousedown/touchstart happens outside the referenced element.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler?: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    if (!handler) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener, true);
    document.addEventListener('touchstart', listener, true);

    return () => {
      document.removeEventListener('mousedown', listener, true);
      document.removeEventListener('touchstart', listener, true);
    };
  }, [ref, handler]);
}
