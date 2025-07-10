import { Contract } from '@/environment';
import { useAPIQuery } from '@/server/api/client';

const MODELS_KEYS: (keyof Contract)[] = [
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'OPENAI_API_KEY',
  'OLLAMA_ENABLED',
];

export function useEnvironmentStatus() {
  const { data } = useAPIQuery('GET /home/info');
  const env = data?.env ?? [];
  return env.some(
    (env) => MODELS_KEYS.includes(env.key as keyof Contract) && env.value
  );
}
