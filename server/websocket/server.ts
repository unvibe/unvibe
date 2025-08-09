import WebSocket, { WebSocketServer } from 'ws';
import { StructuredChatMessage } from './types';

let websocketServerInstance: WebSocketServer | null = null;

export function startWebsocketServer(port: number) {
  if (websocketServerInstance) return websocketServerInstance;
  const wss = new WebSocketServer({ port });
  websocketServerInstance = wss;

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      // Broadcast the message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  console.log(`WebSocket server is running on ws://localhost:${port}`);
  return wss;
}

export function sendWebsocketEvent<T extends Record<string, unknown>>(
  message: StructuredChatMessage<T>
) {
  const wss = websocketServerInstance;
  if (!wss) {
    console.warn('WebSocket server not started');
    return;
  }
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
