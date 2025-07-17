import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db } from '@/server/db';
import { messages, StructuredOutputMetadata } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const editProposalFile = createEndpoint({
  type: 'POST',
  pathname: '/threads/edit-proposal-file',
  params: z.object({
    projectId: z.string(),
    messageId: z.string(),
    newContentFilePath: z.string(),
    newContentFileContent: z.string(),
  }),
  handler: async ({ parsed }) => {
    const message = await db.query.messages.findFirst({
      where: (messages, { eq }) => eq(messages.id, parsed.messageId),
    });

    if (!message || !message.content) {
      throw new Error('Message not found');
    }

    const updatedContent = Object.fromEntries(
      Object.entries(message.metadata?.resolved || {}).map((entry) => {
        const key = entry[0];
        if (key === parsed.newContentFilePath) {
          return [key, parsed.newContentFileContent] as const;
        }
        return entry;
      })
    );

    const metadata = {
      ...message.metadata,
      resolved: updatedContent,
    } as StructuredOutputMetadata;
    // TODO: re-run metadata creation

    await db
      .update(messages)
      .set({
        metadata,
      })
      .where(eq(messages.id, parsed.messageId));

    return {
      status: true,
    };
  },
});
