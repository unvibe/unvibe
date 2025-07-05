// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import {
  HiArrowLongLeft,
  HiArrowLongRight,
  HiArrowPath,
  HiChevronDown,
  HiXMark,
} from 'react-icons/hi2';
import { Modal } from '@/lib/ui/modal';
import { useCallback, useRef, useState } from 'react';

export function AssistantMessageDemoModal({
  closeModal,
  url,
}: {
  closeModal: () => void;
  url: string;
}) {
  const [currentUrl, setCurrentUrl] = useState(url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onIframe = useCallback((node: HTMLIFrameElement | null) => {
    if (!node) return;
    iframeRef.current = node;

    const updateUrl = () => {
      if (iframeRef.current) {
        setCurrentUrl(
          iframeRef.current.contentWindow?.location.pathname || url
        );
      }
    };

    // Patch pushState/replaceState in the iframe
    const patchHistory = () => {
      const win = node.contentWindow;
      if (!win) return;
      const origPushState = win.history.pushState;
      const origReplaceState = win.history.replaceState;
      win.history.pushState = function (...args) {
        const ret = origPushState.apply(this, args);
        win.dispatchEvent(new Event('urlchange'));
        return ret;
      };
      win.history.replaceState = function (...args) {
        const ret = origReplaceState.apply(this, args);
        win.dispatchEvent(new Event('urlchange'));
        return ret;
      };
    };

    node.addEventListener('load', () => {
      updateUrl();
      patchHistory();
    });
    node.contentWindow?.addEventListener('popstate', updateUrl);
    node.contentWindow?.addEventListener('urlchange', updateUrl);

    // Cleanup
    return () => {
      node.removeEventListener('load', updateUrl);
      node.contentWindow?.removeEventListener('popstate', updateUrl);
      node.contentWindow?.removeEventListener('urlchange', updateUrl);
    };
  }, []);
  return (
    <Modal onClose={closeModal}>
      <div className='w-[80vw] h-[80vh] relative box-border max-w-7xl mx-auto'>
        <div className='w-full flex items-center bg-background-2 p-2 px-4 justify-between gap-4'>
          <div className='w-full flex items-stretch gap-4'>
            <div className='flex gap-2 items-center'>
              <button
                className='p-2 cursor-pointer hover:bg-background-1/50 rounded-full'
                onClick={(e) => {
                  e.stopPropagation();
                  if (iframeRef.current) {
                    iframeRef.current.contentWindow?.history.back();
                  }
                }}
              >
                <HiArrowLongLeft className='w-5 h-5 text-foreground-2' />
              </button>
              <button
                className='p-2 cursor-pointer hover:bg-background-1/50 rounded-full'
                onClick={(e) => {
                  e.stopPropagation();
                  if (iframeRef.current) {
                    iframeRef.current.contentWindow?.history.forward();
                  }
                }}
              >
                <HiArrowLongRight className='w-5 h-5 text-foreground-2' />
              </button>
              <button
                className='p-2 cursor-pointer hover:bg-background-1/50 rounded-full'
                onClick={(e) => {
                  e.stopPropagation();
                  if (iframeRef.current) {
                    iframeRef.current.contentWindow?.location.reload();
                  }
                }}
              >
                <HiArrowPath className='w-5 h-5 text-foreground-2' />
              </button>
            </div>
            <div className='flex items-stretch bg-background rounded-2xl p-1 focus-within:ring-2 w-full'>
              <button className='p-2 bg-background-1 rounded-xl cursor-pointer border border-border-1'>
                <HiChevronDown className='w-5 h-5' />
              </button>
              <input
                defaultValue={`http://localhost:3005${url}`}
                value={`http://localhost:3005${currentUrl}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (iframeRef.current) {
                      iframeRef.current.contentWindow?.history.pushState(
                        {},
                        '',
                        currentUrl
                      );
                      iframeRef.current.contentWindow?.location.reload();
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
              className='p-2 rounded-full bg-background-1/50 shrink-0 cursor-pointer'
              onClick={closeModal}
            >
              <HiXMark className='w-6 h-6' />
            </button>
          </div>
        </div>
        <iframe
          ref={onIframe}
          src={url}
          className='w-full h-[calc(100%-60px)]'
        />
      </div>
    </Modal>
  );
}
