// UI for dev_propose_only agent, with full code quality check (no continueThread mutation) and custom choices buttons
import {
  HiArrowLongLeft,
  HiArrowLongRight,
  HiArrowPath,
  HiChevronDown,
} from 'react-icons/hi2';
import { useEffect, RefObject } from 'react';
import { noop } from '@/lib/core/noop';

export const ProjectVisualModeEntry = function ProjectVisualModeEntry({
  src,
  ref,
  onPathnameChange,
}: {
  src: string;
  ref?: RefObject<HTMLIFrameElement | null>;
  onPathnameChange?: (pathname: string) => void;
}) {
  console.log(src);
  return (
    <div className='h-full w-full relative box-border'>
      <div className='w-full flex items-center bg-background-2 p-2 px-4 justify-between gap-4 border-b border-border'>
        <div className='w-full flex items-stretch gap-4'>
          <div className='flex gap-2 items-center'>
            <button
              className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
              onClick={(e) => {
                e.stopPropagation();
                try {
                  ref?.current?.contentWindow?.history.back();
                } catch {
                  // cross-origin: no-op
                }
              }}
            >
              <HiArrowLongLeft className='w-5 h-5 text-foreground-2' />
            </button>
            <button
              className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
              onClick={(e) => {
                e.stopPropagation();
                try {
                  ref?.current?.contentWindow?.history.forward();
                } catch {
                  // cross-origin: no-op
                }
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
              value={src}
              onChange={noop}
              className='font-mono w-full ps-4 focus:outline-none'
            />
          </div>
        </div>
        <div className='shrink-0'>
          <button
            className='p-2 cursor-pointer bg-background-1/50 rounded-xl'
            onClick={(e) => {
              e.stopPropagation();
              try {
                if (ref?.current) {
                  const src = ref?.current.src;
                  ref.current.src = src; // force reload
                }
              } catch {
                // ignore
              }
            }}
          >
            <HiArrowPath className='w-5 h-5 text-foreground-2' />
          </button>
        </div>
      </div>
      <iframe
        ref={ref}
        src={new URL(src).origin}
        onLoad={(e) => {
          const win = e.currentTarget.contentWindow;
          if (!win) return;
          try {
            const { pathname } = win.location;
            onPathnameChange?.(pathname);
          } catch {
            // cross-origin: can't read location
          }
          if (win) {
            const origPushState = win.history.pushState;
            const origReplaceState = win.history.replaceState;
            try {
              win.history.pushState = function (...args) {
                const ret = origPushState.apply(this, args as never);
                win.dispatchEvent(new Event('urlchange'));
                return ret;
              } as typeof win.history.pushState;
              console.log(win.history.pushState);
              win.history.replaceState = function (...args) {
                const ret = origReplaceState.apply(this, args as never);
                win.dispatchEvent(new Event('urlchange'));
                return ret;
              } as typeof win.history.replaceState;
              win.addEventListener('popstate', () => {
                try {
                  const { pathname } = win.location;
                  onPathnameChange?.(pathname);
                } catch {
                  // cross-origin: can't read location
                }
              });
              win.addEventListener('urlchange', () => {
                try {
                  const { pathname } = win.location;
                  onPathnameChange?.(pathname);
                } catch {
                  // cross-origin: can't read location
                }
              });
            } catch {
              // cross-origin: ignore
              console.log('CROSS ORIGIN');
            }
          }
        }}
        className='w-full h-[calc(100%-60px)] bg-background'
      />
    </div>
  );
};

export async function captureScreenshot(
  iframe?: RefObject<HTMLIFrameElement | null>
): Promise<Blob | null> {
  const node = iframe?.current;
  if (!node) return null;

  // Try same-origin DOM render via html2canvas injected into iframe
  try {
    const win = node.contentWindow;
    const doc = win?.document;
    if (win && doc) {
      // Accessing doc will throw on cross-origin; guarded by try/catch
      await waitForIframeReady(win);
      const h2c = await ensureHtml2Canvas(win);

      // Use viewport size to avoid giant canvases that can end up blank/black
      const vw = doc.documentElement.clientWidth || win.innerWidth || 800;
      const vh = doc.documentElement.clientHeight || win.innerHeight || 600;

      const canvas: HTMLCanvasElement = await h2c(doc.documentElement, {
        useCORS: true,
        logging: false,
        backgroundColor: safeBackground(win, doc),
        // Avoid massive full-document captures that can OOM and produce black canvases
        windowWidth: vw,
        windowHeight: vh,
        // Reasonable scale to keep things crisp but not explode memory
        scale: Math.min(
          2,
          win.devicePixelRatio || window.devicePixelRatio || 1
        ),
        // Ensure we capture what's visible in the viewport
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
      });

      // In rare cases canvases can be zero-sized; guard it
      if (!canvas || canvas.width < 2 || canvas.height < 2) {
        throw new Error('Canvas size invalid');
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob) return blob;
    }
  } catch (e) {
    noop(e);
    // cross-origin, CSP blocks, or rendering failure => fallback
    // console.debug('html2canvas capture failed, falling back', e);
  }

  // Fallback: render a clear placeholder (not actual iframe content)
  try {
    const rect = node.getBoundingClientRect();
    const cw = Math.max(320, Math.floor(rect.width) || 800);
    const ch = Math.max(180, Math.floor(rect.height) || 450);
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient so it doesn't look like a bug/black frame
      const g = ctx.createLinearGradient(0, 0, 0, ch);
      g.addColorStop(0, '#1a1f24');
      g.addColorStop(1, '#0f1317');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);

      // Draw message box
      const pad = 16;
      const boxW = Math.min(cw - pad * 2, 560);
      const boxX = pad;
      const boxY = pad;
      const boxH = 96;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

      // Text
      ctx.fillStyle = '#e5e7eb';
      ctx.font =
        '600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial';
      ctx.fillText(
        'Preview screenshot unavailable (cross-origin)',
        boxX + 14,
        boxY + 30
      );
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillText(
        'Tip: Use the same origin or a port that matches this app to enable full screenshots.',
        boxX + 14,
        boxY + 72
      );
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    return blob;
  } catch (e) {
    console.error('Fallback screenshot failed:', e);
    return null;
  }
}

async function waitForIframeReady(win: Window) {
  try {
    const doc = win.document;
    // Wait for readyState complete
    if (doc.readyState !== 'complete') {
      await new Promise<void>((res) =>
        win.addEventListener('load', () => res(), { once: true })
      );
    }
    // Wait for fonts
    try {
      // fonts.ready can reject in some environments; ignore errors
      await doc.fonts?.ready;
    } catch {
      noop();
    }
    // Small stabilization delay (layout/animations/mutations)
    await new Promise((r) =>
      win.requestAnimationFrame(() => win.requestAnimationFrame(() => r(null)))
    );
  } catch {
    // cross-origin or unexpected errors: ignore
  }
}

const safeBackground = (win: Window, doc: Document) => {
  try {
    const root = doc.documentElement;
    const bg = win.getComputedStyle(root).backgroundColor || '';
    // simple validation for rgb/rgba/hex keywords; fallback if transparent
    if (bg && !/transparent/i.test(bg)) return bg;
  } catch {
    noop();
  }
  // Fallback to a neutral background to avoid black frames
  return '#111418';
};

async function ensureHtml2Canvas(win: Window) {
  const w = win as unknown as { html2canvas?: unknown };
  if (w.html2canvas) return w.html2canvas;
  await new Promise<void>((resolve, reject) => {
    try {
      const s = win.document.createElement('script');
      s.src =
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load html2canvas'));
      win.document.head.appendChild(s);
    } catch (e) {
      reject(e as Error);
    }
  });
  return (win as unknown as { html2canvas: unknown }).html2canvas;
}
