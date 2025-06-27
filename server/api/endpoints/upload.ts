import * as s3 from '@/server/s3';
import { createEndpoint } from '../create-endpoint';
import { z } from 'zod';

export const requestSignedUploadURLs = createEndpoint({
  type: 'POST',
  pathname: '/upload/request-signed-upload-urls',
  params: z.object({
    files: z.array(z.object({ key: z.string(), contentType: z.string() })),
  }),
  handler: async ({ parsed }) => {
    const urls = await Promise.all(
      parsed.files.map(({ key, contentType }) =>
        s3.getUploadUrl(key, contentType)
      )
    );
    return { signedUploadURLs: urls };
  },
});

export const getDownloadUrl = createEndpoint({
  type: 'GET',
  pathname: '/upload/download-url',
  params: z.object({
    key: z.string(),
  }),
  handler: async ({ parsed: params }) => {
    const downloadUrl = await s3.getDownloadUrl(params.key);
    return { downloadUrl };
  },
});

export const deleteFile = createEndpoint({
  type: 'POST',
  pathname: '/upload/delete-file',
  params: z.object({
    key: z.string(),
  }),
  handler: async ({ parsed: params }) => {
    await s3.deleteFile(params.key);
    return { success: true };
  },
});

export const deleteFiles = createEndpoint({
  type: 'POST',
  pathname: '/upload/delete-files',
  params: z.object({
    keys: z.array(z.string()),
  }),
  handler: async ({ parsed: params }) => {
    const deletedCount = await s3.deleteFiles(params.keys);
    return { deletedCount };
  },
});
