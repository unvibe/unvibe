import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'gpt-5-nano-2025-08-07',
  displayName: 'GPT 5 Nano',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 0.05,
    inCached: 0.005,
    out: 0.4,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
