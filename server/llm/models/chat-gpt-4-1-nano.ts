import { ModelConfig } from './_shared-types';

const GPT_4_1_NANO_2025_04_14 = 'gpt-4.1-nano-2025-04-14';

export const MODEL_CONFIG: ModelConfig = {
  id: GPT_4_1_NANO_2025_04_14,
  displayName: 'GPT-4.1 Nano',
  supports: {
    text: true,
    tools: true,
    image: true,
    json: true,
    temp: true,
  },
  pricing: {
    in: 0.1,
    inCached: 0.025,
    out: 0.4,
  },
  defaultRunner: 'openai-chat-completions',
};
