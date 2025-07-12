import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'kimi-k2-0711-preview',
  displayName: 'Kimi 128k',
  supports: {
    text: true,
    tools: true,
    json: true,
  },
  pricing: {
    in: 2.0,
    inCached: 0.15,
    out: 5.0,
  },
  defaultRunner: 'moonshot',
  isEnabled: !!process.env.MOONSHOT_API_KEY,
};
