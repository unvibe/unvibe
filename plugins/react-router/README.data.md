# Data Mode: Minimal Operations

## 1. Add a Page

- Add a component (e.g. `AboutPage.tsx`).
- Add a route object to your router config:

```ts
import { createBrowserRouter } from 'react-router';

const router = createBrowserRouter([
  { path: 'about', element: <AboutPage /> },
]);
```

## 2. Remove a Page

- Remove the route object from the config.
- Optionally delete the component file.

## 3. Add a Loader

- Add a `loader` property to the route object:

```ts
const router = createBrowserRouter([
  {
    path: 'about',
    element: <AboutPage />,
    loader: async () => {
      return { value: 42 };
    },
  },
]);

function AboutPage() {
  const data = useLoaderData();
  return <div>{data.value}</div>;
}
```
