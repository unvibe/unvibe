# API Folder Overview

This folder implements a **type-safe, extensible API layer** for the project, using modern TypeScript and Zod for validation. It enables both the server and client to share types, catch errors at compile-time, and provide a robust developer experience.

---

## Folder Structure

- **index.ts** – Entrypoint for the API; exports the type-safe `api` object.
- **create-api.ts** – Helper to build the API object from endpoints.
- **create-endpoint.ts** – Factory for strongly-typed endpoints using Zod schemas.
- **endpoints/** – Directory containing endpoint definitions (grouped by domain).
- **client/** – Typed client & React hooks for consuming the API from the frontend.
- **constants.ts** – API base URL and other shared constants.

---

## How Types Work in Harmony

### 1. Defining Endpoints

Endpoints are created with `createEndpoint`, which enforces:
- The HTTP method (`type: 'GET', 'POST', etc.`)
- The path
- An optional Zod schema for `params`, ensuring runtime and compile-time validation.
- A handler function (async or sync) that returns the output.

Example:
```ts
export const getDownloadUrl = createEndpoint({
  type: 'GET',
  pathname: '/upload/download-url',
  params: z.object({ key: z.string() }),
  handler: async ({ parsed: params }) => {
    // ...
    return { downloadUrl };
  },
});
```

### 2. API Object & Type Inference

All endpoints are aggregated into a single `api` object in `index.ts`. This object is passed through `createAPI`, and its type (`API`) is exported. This means every endpoint's input/output types are unified and accessible.

### 3. The Typed Client

The client code (`client/create.ts`) consumes the `API` type to automatically generate a map of endpoints, each with precise input/output types:
```ts
type Client = API['endpoints'];
export type Endpoints = {
  [K in keyof Client as `${Client[K]['type']} ${Client[K]['pathname']}`]: {
    input: InferParams<Client[K]['params']>;
    output: Awaited<ReturnType<Client[K]['handler']>>;
  };
};
```

This mapping ensures that if you change an endpoint's types on the server, the client **immediately knows** and will type-error if you use it incorrectly.

### 4. End-to-End Type Safety

- **Params and outputs are always validated** both at runtime (via Zod) and compile-time (via TypeScript).
- **No manual typing is needed on the client**—all types are inferred from the server.
- This means: **If you change an endpoint's params or return type, the client is kept in sync automatically.**

---

## Consuming the API on the Client

### The `client` Instance

The `client` is a function that takes an endpoint key (like `'GET /upload/download-url'`) and params, and returns a typed promise for the output:
```ts
client('GET /upload/download-url', { key: 'my-file-key' });
```

### React Query Hooks: `useAPIQuery` and `useAPIMutation`

- **`useAPIQuery`** is a custom hook for fetching data with React Query.
- It is fully typed with the correct input/output for the endpoint you specify.
- It handles caching, status, errors, etc.

Example:
```tsx
const { data, error, isLoading } = useAPIQuery('GET /threads/list', { projectId: 'abc', archived: false });
```
You get full type safety for both the input params and the returned data.

- **`useAPIMutation`** is for POST/PUT/DELETE endpoints, also fully typed.

---

## Why This is Great for TypeScript Beginners

- **No guessing required**: All parameters and responses are type-checked end-to-end.
- **Single source of truth**: Change your types in the server endpoint, and your client code gets the update instantly.
- **Safer, faster development**: No more mismatches between frontend and backend types.
- **Powered by Zod**: All input is validated at runtime as well as compile time.

---

## How to Add a New Endpoint

1. Create a new file or add to an existing one in `/endpoints`.
2. Use `createEndpoint` to define your route, params, and handler.
3. Export it.
4. Add it to `/endpoints/index.ts` if needed.
5. The client and hooks will automatically pick up the new endpoint and expose it as a typed function.

---

## Summary

- **Type-safe**: Server and client always agree on data shapes.
- **Extensible**: Add endpoints easily.
- **Easy to use**: React hooks provide a simple, type-safe way to use your API.
- **Great for learning**: Teaches good TypeScript and API design practices.

---

*Happy coding!*
