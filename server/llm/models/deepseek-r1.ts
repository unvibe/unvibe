import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'deepseek-r1:latest',
  displayName: 'DeepSeek R1 8B',
  supports: {
    text: true,
    json: true,
    reasoning: true,
  },
  pricing: {
    in: 0,
    inCached: 0,
    out: 0,
  },
  defaultRunner: 'ollama',
  isEnabled: !!process.env.OLLAMA_ENABLED,
};
