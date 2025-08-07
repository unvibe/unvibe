import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'gpt-5-2025-08-07',
  displayName: 'GPT 5',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 1.25,
    inCached: 0.125,
    out: 10.0,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
