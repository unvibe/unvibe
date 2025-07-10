import { Contract } from '.';

export function get(key: keyof Contract) {
  try {
    const value = process.env[key];
    return value || '';
  } catch (error) {
    console.error(`Error fetching environment variable ${key}:`, error);
    return '';
  }
}

export function getAll(): Contract {
  return {
    OPENAI_API_KEY: get('OPENAI_API_KEY'),
    GOOGLE_API_KEY: get('GOOGLE_API_KEY'),
    ANTHROPIC_API_KEY: get('ANTHROPIC_API_KEY'),
    OLLAMA_ENABLED: get('OLLAMA_ENABLED'),

    AWS_ACCESS_KEY_ID: get('AWS_ACCESS_KEY_ID'),
    AWS_ACCESS_SECRET_KEY: get('AWS_ACCESS_SECRET_KEY'),
    AWS_S3_BUCKET: get('AWS_S3_BUCKET'),
    AWS_S3_REGION: get('AWS_S3_REGION'),
    AWS_CLOUDFRONT_CDN_URL: get('AWS_CLOUDFRONT_CDN_URL'),
    BROWSERLESS_API_KEY: get('BROWSERLESS_API_KEY'),
  };
}
