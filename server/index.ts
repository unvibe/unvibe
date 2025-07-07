import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { startWebsocketServer } from './websocket/server';
import { api } from './api';
import { baseURL } from './api/constants';
import './lsp-websocket-server';

const app = new Hono();

app.use('*', cors());

app.all(`${baseURL}/*`, async (c) => {
  // This is a placeholder for the /api/v2/* route
  // You can implement your logic here or forward it to another service
  const request = c.req.raw;

  try {
    const method = request.method as 'GET';
    const pathname = new URL(request.url).pathname;
    const handlerPathname = pathname.replace('/api/v2', '');
    const pool = Object.values(api.endpoints);
    const endpoint = pool.find(
      (endpoint) =>
        endpoint.pathname === handlerPathname && endpoint.type === method
    );

    if (!endpoint) {
      return c.json({ message: `handler not found` }, 404);
    }

    const handler = endpoint.handler;
    const inputs = method === 'GET' ? c.req.query() : await c.req.json();
    try {
      const parsed = endpoint.params?.parse(inputs);
      const result = await handler({
        parsed: parsed as never,
        request,
      });
      return c.json(result);
    } catch (error) {
      // bad request
      if (error instanceof Error) {
        return c.json(
          {
            message: error.message || 'Internal Server Error',
            stack: error.stack,
          },
          400
        );
      }
      return c.json({ message: 'Internal Server Error' }, 500);
    }
  } catch (error) {
    if (error instanceof Error) {
      // If the error is a Response, return it directly
      return c.json(
        {
          message: error.message || 'Internal Server Error',
          stack: error.stack,
        },
        500
      );
    }
    return c.json({ message: 'Internal Server Error' }, 500);
  }
});

const port = 3008;
console.log(`Hono server listening on http://localhost:${port}`);

startWebsocketServer();
serve({ fetch: app.fetch, port });
