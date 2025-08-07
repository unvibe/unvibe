// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import {
  HiArrowLongLeft,
  HiArrowLongRight,
  HiArrowPath,
  HiChevronDown,
} from 'react-icons/hi2';
import { useCallback, useEffect, useRef, useState } from 'react';

export function ProjectVisualModeEntry({ url }: { url: string }) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const node = iframeRef.current;
    if (!node) return;
    if (typeof window === 'undefined') return;

    const updateUrl = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        const { origin, pathname, search, hash } = win.location;
        setCurrentUrl(`${origin}${pathname}${search}${hash}`);
      } catch {
        // cross-origin guard
      }
    };

    const patchHistory = () => {
      const win = node.contentWindow;
      if (!win) return;
      const origPushState = win.history.pushState;
      const origReplaceState = win.history.replaceState;
      win.history.pushState = function (...args) {
        const ret = origPushState.apply(this, args as never);
        win.dispatchEvent(new Event('urlchange'));
        return ret;
      } as typeof win.history.pushState;
      win.history.replaceState = function (...args) {
        const ret = origReplaceState.apply(this, args as never);
        win.dispatchEvent(new Event('urlchange'));
        return ret;
      } as typeof win.history.replaceState;
    };

    const onLoad = () => {
      updateUrl();
      patchHistory();
    };

    try {
      node.addEventListener('load', onLoad);
      node.contentWindow?.addEventListener('popstate', updateUrl);
      node.contentWindow?.addEventListener('urlchange', updateUrl);

      return () => {
        node.removeEventListener('load', onLoad);
        node.contentWindow?.removeEventListener('popstate', updateUrl);
        node.contentWindow?.removeEventListener('urlchange', updateUrl);
      };
    } catch (error) {
      console.error('Error patching iframe history:', error);
    }
  }, []);

  const onIframe = useCallback((node: HTMLIFrameElement | null) => {
    if (!node) return;
    iframeRef.current = node;
  }, []);

  return (
    <div className='h-full w-full relative box-border'>
      <div className='w-full flex items-center bg-background-2 p-2 px-4 justify-between gap-4 border-b border-border'>
        <div className='w-full flex items-stretch gap-4'>
          <div className='flex gap-2 items-center'>
            <button
              className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
              onClick={(e) => {
                e.stopPropagation();
                iframeRef.current?.contentWindow?.history.back();
              }}
            >
              <HiArrowLongLeft className='w-5 h-5 text-foreground-2' />
            </button>
            <button
              className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
              onClick={(e) => {
                e.stopPropagation();
                iframeRef.current?.contentWindow?.history.forward();
              }}
            >
              <HiArrowLongRight className='w-5 h-5 text-foreground-2' />
            </button>
          </div>
          <div className='flex items-stretch bg-background rounded-2xl p-1 focus-within:ring-2 w-full'>
            <button className='p-2 bg-background-1 rounded-xl cursor-pointer border border-border-1'>
              <HiChevronDown className='w-5 h-5' />
            </button>
            <input
              value={currentUrl}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const win = iframeRef.current?.contentWindow;
                  if (!win) return;
                  try {
                    // If user entered a relative path, keep same origin
                    const next = currentUrl.startsWith('http')
                      ? currentUrl
                      : new URL(currentUrl, win.location.origin).toString();
                    win.history.pushState({}, '', next);
                    win.location.reload();
                  } catch (err) {
                    console.error('Navigation error:', err);
                  }
                }
              }}
              onChange={(e) => {
                setCurrentUrl(e.target.value);
              }}
              className='font-mono w-full ps-4 focus:outline-none'
            />
          </div>
        </div>
        <div className='shrink-0'>
          <button
            className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
            onClick={(e) => {
              e.stopPropagation();
              iframeRef.current?.contentWindow?.location.reload();
            }}
          >
            <HiArrowPath className='w-5 h-5 text-foreground-2' />
          </button>
        </div>
      </div>
      <iframe
        ref={onIframe}
        src={currentUrl}
        className='w-full h-[calc(100%-60px)]'
      />
    </div>
  );
}
