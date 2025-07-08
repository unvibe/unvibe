// Generate .d.ts for a given TypeScript file using tsc, return its contents
import { createEndpoint } from '@/server/api/create-endpoint';
import { z } from 'zod';

export const typesDts = createEndpoint({
  type: 'GET',
  pathname: '/types-dts',
  params: z.object({
    filePath: z.string(), // relative to project root
  }),
  handler: async ({ parsed }) => {
    const { filePath } = parsed;
    console.log('Fetching DTS for:', filePath);
    return {};
  },
});
