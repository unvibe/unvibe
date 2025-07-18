# Framework Mode: Minimal Operations

## 1. Add a Page

- Add a file (e.g. `app/routes/about.tsx`).
- Register it in `app/routes.ts`:

```ts
import { route } from '@react-router/dev/routes';

export default [route('about', './routes/about.tsx')];
```

- Example page module:

```ts
export default function About() {
  return <div>About Page</div>;
}
```

## 2. Remove a Page

- Remove `app/routes/about.tsx`.
- Remove or comment out its entry from `app/routes.ts`.

## 3. Add a Loader (Client/Server)

- In a route file:

```ts
import { Route } from './+types/about';

export async function loader({ params }: Route.LoaderArgs): Promise<Route.LoaderData> {
  // Server-side loader code
  return { value: 42 };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs): Promise<Route.LoaderData> {
  // Client-side loader code (optional)
  return { value: 42 };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.value}</div>;
}
```
