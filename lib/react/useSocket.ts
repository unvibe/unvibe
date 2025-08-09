import { BACKEND_WS_PORT } from '@/server/constants.vite';
import { useEffect, useRef, useCallback, useState } from 'react';

export interface SocketMessage {
  id: string;
  type: string;
  content: unknown;
}

/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  Global socket instance & simple pub-sub so hooks know when it changes
 * ────────────────────────────────────────────────────────────────────────────────
 */
export let socket: WebSocket | null = null;

type SocketListener = (ws: WebSocket | null) => void;
const socketListeners: SocketListener[] = [];

function notifySocketUpdate(ws: WebSocket | null) {
  socketListeners.forEach((cb) => cb(ws));
}

export function onSocketUpdate(cb: SocketListener) {
  socketListeners.push(cb);
  return () => {
    const idx = socketListeners.indexOf(cb);
    if (idx !== -1) socketListeners.splice(idx, 1);
  };
}

let retryCount = 0;
const maxRetries = Infinity; // unlimited retries
const url = `ws://localhost:${BACKEND_WS_PORT}`;

function connectSocket() {
  if (retryCount >= maxRetries) {
    console.warn('WebSocket: Max retries reached. Giving up.');
    return;
  }

  socket = new WebSocket(url);
  notifySocketUpdate(socket);

  socket.addEventListener('open', () => {
    console.log('WebSocket connected.');
    retryCount = 0; // reset retries
  });

  socket.addEventListener('close', () => {
    retryCount += 1;
    console.log(`WebSocket closed. Retry ${retryCount}/${maxRetries}`);
    // notify that socket is no longer usable (helps hooks detach)
    notifySocketUpdate(null);
    setTimeout(connectSocket, retryCount * 1000); // linear back-off
  });

  socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err);
    socket?.close(); // will trigger close -> reconnect path
  });
}

// Start connection only in the browser environment
if (typeof window !== 'undefined') {
  connectSocket();
}

/**
 * React hook for convenient WebSocket usage.
 * Automatically re-attaches to new sockets created during reconnect flow.
 */
export function useSocket({
  onMessage,
}: {
  onMessage?: (msg: SocketMessage | string) => void;
}) {
  const [currentSocket, setCurrentSocket] = useState<WebSocket | null>(
    () => socket
  );
  const onMessageRef = useRef(onMessage);

  // keep latest callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // subscribe to socket updates (created / destroyed)
  useEffect(() => {
    return onSocketUpdate((ws) => setCurrentSocket(ws));
  }, []);

  // attach message listener for the active socket
  useEffect(() => {
    if (!currentSocket) return;

    function handleMessage(event: MessageEvent) {
      let data: unknown = event.data;
      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          /* raw string remains */
        }
      }
      onMessageRef.current?.(data as SocketMessage | string);
    }

    currentSocket.addEventListener('message', handleMessage);
    return () => currentSocket.removeEventListener('message', handleMessage);
  }, [currentSocket]);

  const send = useCallback(
    (msg: SocketMessage) => {
      if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
        currentSocket.send(JSON.stringify(msg));
      } else {
        console.warn('WebSocket is not open. Cannot send message.');
      }
    },
    [currentSocket]
  );

  return { send, socket: currentSocket } as const;
}
