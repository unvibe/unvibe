# Next.js App Router Mode

This project uses the **App Router** (the `app/` directory) for routing.

- Routes are defined by folders inside the `app/` directory.
- A route becomes publicly accessible when a `page.js`, `page.tsx`, etc., file is present in a folder.
- Route groups (folders in parentheses, e.g. `(marketing)`) organize routes without affecting the URL path.
- Private folders (starting with `_`) and their contents are not routable.
- Dynamic routes use bracket notation: `[param]`, `[...param]`, `[[...param]]`.

**UIEntries** for App Router are all discovered `page.*` files under `app/`, mapped to their corresponding URLs.
