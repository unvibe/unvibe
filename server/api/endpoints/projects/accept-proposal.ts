import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { _parseProject } from './utils';
import { db } from '@/server/db';

type Acceptance = Record<
  string,
  { path: string; status: 'success' | 'error'; payload?: string }[]
>;

export const acceptProposal = createEndpoint({
  type: 'POST',
  pathname: '/projects/accept-proposal',
  params: z.object({
    id: z.string(), // project id
    messageId: z.string(),
    selections: z.record(
      z.array(z.object({ path: z.string(), selected: z.boolean() }))
    ),
  }),
  handler: async ({ parsed }) => {
    const project = await _parseProject(parsed.id);
    const message = await db.query.messages.findFirst({
      where: (m, { eq }) => eq(m.id, parsed.messageId),
    });

    const result: Acceptance = {};

    project.registeredStructuredOutput.forEach(async (so) => {
      const selections = parsed.selections[so.key] || [];
      const resolved = message?.metadata?.resolved?.[so.key];
      if (typeof so.apply === 'function') {
        result[so.key] = await so.apply(
          project,
          message?.metadata?.parsed?.[so.key],
          selections,
          resolved
        );
      }
    });

    return result;
  },
});
