import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: 'file:./local.db',
  },
});
