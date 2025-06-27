import {
  GetObjectCommand,
  PutObjectCommand,
  S3,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const CDN_URL = process.env.AWS_CLOUDFRONT_CDN_URL!;

const config = {
  REGION: process.env.AWS_S3_REGION!,
  ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID!,
  SECRET_KEY: process.env.AWS_ACCESS_SECRET_KEY!,
  BUCKET_NAME: process.env.AWS_S3_BUCKET!,
};

const s3 = new S3({
  region: config.REGION,
  credentials: {
    accessKeyId: config.ACCESS_KEY,
    secretAccessKey: config.SECRET_KEY,
  },
});

export async function getUploadUrl(key: string, contentType: string) {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  };
  try {
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    }); // URL valid for 1 hour
    return uploadUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
) {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `${CDN_URL}/${key}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: key,
  };
  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${key}:`, error);
    throw error;
  }
}

export async function deleteFiles(keys: string[]): Promise<number> {
  const objectsToDelete = keys.map((key) => ({ Key: key }));
  const params = {
    Bucket: config.BUCKET_NAME,
    Delete: { Objects: objectsToDelete },
  };
  try {
    const command = new DeleteObjectsCommand(params);
    const response = await s3.send(command);
    return response.Deleted?.length ?? 0;
  } catch (error) {
    console.error(`Error deleting files ${keys.join(', ')}:`, error);
    throw error;
  }
}

export async function getDownloadUrl(key: string) {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
    return downloadUrl;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
}
