import { ModelConfig } from './_shared-types';

const GPT_O3_2025_04_16 = 'o3-2025-04-16';

export const MODEL_CONFIG: ModelConfig = {
  id: GPT_O3_2025_04_16,
  displayName: 'GPT-O3',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
    reasoning: true,
  },
  pricing: {
    in: 2.0,
    inCached: 0.5,
    out: 8.0,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
