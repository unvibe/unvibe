import { ModelConfig } from './_shared-types';

const GPT_O4_MINI_2025_04_16 = 'o4-mini-2025-04-16';

export const MODEL_CONFIG: ModelConfig = {
  id: GPT_O4_MINI_2025_04_16,
  displayName: 'GPT-O4 Mini',
  supports: {
    text: true,
    image: true,
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
