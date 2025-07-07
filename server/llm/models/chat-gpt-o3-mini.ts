import { ModelConfig } from './_shared-types';

const GPT_O3_MINI_2025_01_31 = 'o3-mini-2025-01-31';

export const MODEL_CONFIG: ModelConfig = {
  id: GPT_O3_MINI_2025_01_31,
  displayName: 'GPT-O3 Mini',
  supports: {
    text: true,
    tools: true,
    json: true,
    reasoning: true,
  },
  pricing: {
    in: 1.1,
    inCached: 0.55,
    out: 4.4,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
