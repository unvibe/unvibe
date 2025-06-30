import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db } from '@/server/db';

// todo: check all metadata of messages and compare its metadata.source_sha1 record
// and mark it as they don't match anymore then the proposal is "outdated"
export const getThreadDetails = createEndpoint({
  type: 'GET',
  pathname: '/threads/details',
  params: z.object({
    id: z.string(),
  }),
  handler: async ({ parsed }) => {
    const { id } = parsed;

    const thread = await db.query.threads.findFirst({
      where: (threads, { eq }) => eq(threads.id, id),
    });

    if (!thread) {
      return {
        thread: null,
        status: false,
        error: 'Thread not found',
      };
    }

    const messages = await db.query.messages.findMany({
      where: (messages, { eq }) => eq(messages.thread_id, id),
      orderBy(fields, operators) {
        return operators.asc(fields.index);
      },
    });

    return {
      status: true,
      error: null,
      thread: {
        ...thread,
        messages,
      },
    };
  },
});
