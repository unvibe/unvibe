import { ModelConfig } from './_shared-types';

const GPT_4_1_2025_04_14 = 'gpt-4.1-2025-04-14';

export const MODEL_CONFIG: ModelConfig = {
  id: GPT_4_1_2025_04_14,
  displayName: 'GPT-4.1',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
    temp: true,
  },
  pricing: {
    in: 2.0,
    inCached: 0.5,
    out: 8.0,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
