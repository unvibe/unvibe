import { Contract } from '@/server/environment';
import { useHomeInfo } from '~/modules/root-providers/home-info';

export const MODELS_KEYS: (keyof Contract)[] = [
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'OPENAI_API_KEY',
  'OLLAMA_ENABLED',
];

export const AWS_KEYS: (keyof Contract)[] = [
  'AWS_ACCESS_KEY_ID',
  'AWS_ACCESS_SECRET_KEY',
  'AWS_CLOUDFRONT_CDN_URL',
  'AWS_S3_BUCKET',
  'AWS_S3_REGION',
];

export function useEnvironmentStatus() {
  const { env } = useHomeInfo();
  return env.some(
    (env) => MODELS_KEYS.includes(env.key as keyof Contract) && env.value
  );
}
