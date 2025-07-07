import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'claude-3-7-sonnet-20250219',
  displayName: 'Claude 3.7 Sonnet',
  supports: {
    text: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 3.0,
    inCached: 0.3,
    out: 15.0,
  },
  defaultRunner: 'anthropic',
  isEnabled: !!process.env.ANTHROPIC_API_KEY,
};
