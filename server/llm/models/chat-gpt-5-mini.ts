import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'gpt-5-mini-2025-08-07',
  displayName: 'GPT 5 Mini',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 0.25,
    inCached: 0.025,
    out: 2.0,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
