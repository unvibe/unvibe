import { z } from 'zod';
import { createEndpoint } from '../../create-endpoint';

export const acceptProposal = createEndpoint({
  type: 'POST',
  pathname: '/projects/accept-proposal',
  params: z.object({
    projectDirname: z.string(),
    source: z.string(),
    proposal: z.object({
      message: z.string(),
      replace_files: z
        .array(z.object({ path: z.string(), content: z.string() }))
        .optional(),
      delete_files: z.array(z.object({ path: z.string() })).optional(),
      edit_files: z
        .array(
          z.object({
            path: z.string(),
            content: z.string(),
            range_start: z.number(),
            range_end: z.number(),
          })
        )
        .optional(),
      shell_scripts: z.array(z.string()).optional(),
    }),
  }),
  handler: async ({ parsed }) => {
    return {};
  },
});
