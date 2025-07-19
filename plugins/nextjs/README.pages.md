# Next.js Pages Router Mode

This project uses the legacy **Pages Router** (the `pages/` directory) for routing.

- Routes are defined by files inside the `pages/` directory.
- The URL path matches the file's path; `index` files map to the root of their folder.
- Special files (`_app`, `_document`, `_error`, `404`, `500`) have framework-specific behavior and are not routable as pages.
- API routes live under `pages/api/` and are excluded from UIEntries.
- Dynamic routes use bracket notation: `[param].js`, `[...param].js`, `[[...param]].js`.

**UIEntries** for Pages Router are all routable files under `pages/` (excluding `api/` and special files), mapped to their URLs.
