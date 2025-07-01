import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';
import { db } from '@/server/db';
import { StructuredOutput } from '@/server/llm/structured_output';
import { messages } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { createMetadata } from './continue-utils';
import { parseProject } from '@/plugins/core/server/api';
import { allPlugins } from './utils';

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

    const content: StructuredOutput = JSON.parse(message.content);
    const previous = content.replace_files?.find(
      (file) => file.path === parsed.newContentFilePath
    );

    if (!previous) {
      throw new Error('File not found in proposal');
    }

    const updatedFiles = content.replace_files?.map((file) => {
      if (file.path === parsed.newContentFilePath) {
        return { ...file, content: parsed.newContentFileContent };
      }
      return file;
    });

    const updatedContent: StructuredOutput = {
      ...content,
      replace_files: updatedFiles,
    };

    const newContent = JSON.stringify(updatedContent);

    const project = await parseProject(
      'projects',
      parsed.projectId,
      allPlugins
    );
    const { partialMetadata } = await createMetadata(newContent, project);

    await db
      .update(messages)
      .set({
        content: JSON.stringify(updatedContent),
        metadata: partialMetadata,
      })
      .where(eq(messages.id, parsed.messageId));

    return {
      status: true,
    };
  },
});
