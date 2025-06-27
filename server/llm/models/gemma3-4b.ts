import { ModelConfig } from './_shared-types';

const GEMMA_3_4b = 'gemma3:4b';

export const MODEL_CONFIG: ModelConfig = {
  id: GEMMA_3_4b,
  displayName: 'Gemma 3 4B',
  supports: {
    text: true,
  },
  pricing: {
    in: 0,
    inCached: 0,
    out: 0,
  },
  defaultRunner: 'ollama',
};
