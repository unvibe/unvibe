# Declarative Mode: Minimal Operations

## 1. Add a Page

- Add a component (e.g. `AboutPage.tsx`).
- Add a `<Route>` to your JSX tree:

```jsx
<BrowserRouter>
  <Routes>
    <Route path='about' element={<AboutPage />} />
  </Routes>
</BrowserRouter>
```

## 2. Remove a Page

- Remove the `<Route>` from the JSX tree.
- Optionally delete the component file.

## 3. Loader (Manual Only)

- Use `useEffect` or similar in your component to fetch data:

```jsx
function AboutPage() {
  const [value, setValue] = React.useState(null);
  React.useEffect(() => {
    fetch('/api/value')
      .then((r) => r.json())
      .then((data) => setValue(data.value));
  }, []);
  return <div>{value}</div>;
}
```
