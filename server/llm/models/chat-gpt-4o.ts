import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'gpt-4o-2024-08-06',
  displayName: 'GPT-4o',
  supports: {
    text: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 2.5,
    inCached: 1.25,
    out: 10.0,
  },
  defaultRunner: 'openai-chat-completions',
  isEnabled: !!process.env.OPENAI_API_KEY,
};
