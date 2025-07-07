// server/lsp-websocket-server.ts
// WebSocket <-> TypeScript Language Server (LSP) relay for Monaco Editor integration

import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

const LSP_PORT = process.env.LSP_WS_PORT
  ? parseInt(process.env.LSP_WS_PORT, 10)
  : 3007;

const wss = new WebSocketServer({ port: LSP_PORT });

wss.on('connection', (ws) => {
  console.log('[LSP] Monaco client connected');

  // Launch typescript-language-server in stdio mode
  const lsp = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'typescript-language-server',
      '--stdio',
      // Optionally add: '--log-level=4',
    ],
    { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] }
  );

  // Forward LSP stdout to the WebSocket
  lsp.stdout.on('data', (data) => {
    console.log('[LSP stdout]', JSON.stringify(data.toString(), null, 2));
    // LSP may send multiple JSON-RPC messages in one chunk
    ws.send(data);
  });

  lsp.stderr.on('data', (data) => {
    console.warn('[LSP stderr]', data.toString());
  });

  lsp.on('exit', (code) => {
    console.warn(`[LSP] typescript-language-server exited with code ${code}`);
    ws.close();
  });

  // Forward WebSocket messages (from Monaco) to LSP stdin
  ws.on('message', (message) => {
    // console.log(
    //   '[LSP] Received message from client:',
    //   JSON.stringify(message.toString(), null, 2)
    // );
    lsp.stdin.write(message);
  });

  ws.on('close', () => {
    lsp.kill();
    console.log('[LSP] Monaco client disconnected');
  });
});

console.log(
  `[LSP] WebSocket LSP relay listening on ws://localhost:${LSP_PORT}`
);
