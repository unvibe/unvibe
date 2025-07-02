import type { API } from '..';
import type { InferParams } from '../create-endpoint';

type Client = API['endpoints'];

export type Endpoints = {
  [K in keyof Client as `${Client[K]['type']} ${Client[K]['pathname']}`]: {
    input: InferParams<Client[K]['params']>;
    output: Awaited<ReturnType<Client[K]['handler']>>;
  };
};

const host = 'http://localhost:3008';

// ------------------- 🔥 Typed Request Function ----------------------
export function createClient(baseURL: string) {
  return async function request<K extends keyof Endpoints>(
    key: K,
    input?: Endpoints[K]['input'],
    token?: string
  ) {
    const [method, path] = (key as string).split(' ');
    const inputType = method === 'GET' ? 'searchParams' : 'body';

    let url = `${host}${baseURL}${path}`;

    if (inputType === 'searchParams') {
      let searchParams = '';
      if (input) {
        searchParams =
          '?' + new URLSearchParams(input as Record<string, string>);
      }
      url = url + searchParams;
    }

    const body = inputType === 'body' ? JSON.stringify(input) : undefined;

    const response = await fetch(url, {
      method: method,
      body: body,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json() as unknown as Endpoints[K]['output'];
  };
}
