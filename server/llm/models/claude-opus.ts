import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'claude-opus-4-20250514',
  displayName: 'Claude Opus 4',
  supports: {
    text: true,
    tools: true,
    json: true,
    reasoning: true,
  },
  pricing: {
    in: 3.0,
    inCached: 0.3,
    out: 15.0,
  },
  defaultRunner: 'anthropic',
  isEnabled: !!process.env.ANTHROPIC_API_KEY,
};
