# Next.js Hybrid Routing: App Router and Pages Router

This project contains **both** `app/` and `pages/` directories.

- **App Router** (`app/`):
  - Folder structure defines nested routes.
  - Only folders with a `page.*` file are accessible as routes.
  - Route groups and private folders are supported.
- **Pages Router** (`pages/`):
  - File structure defines routes and supports dynamic routing with brackets.
  - Special files and API routes are excluded from UIEntries.

**UIEntries** include both App Router and Pages Router entries, merged into a single list for navigation and code intelligence.
