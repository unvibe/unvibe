import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'claude-sonnet-4-20250514',
  displayName: 'Claude 4 Sonnet',
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
};
