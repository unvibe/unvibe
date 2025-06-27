import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'qwen3:latest',
  displayName: 'Qwen 3 8B',
  supports: {
    text: true,
    tools: true,
  },
  pricing: {
    in: 0,
    inCached: 0,
    out: 0,
  },
  defaultRunner: 'ollama',
};
