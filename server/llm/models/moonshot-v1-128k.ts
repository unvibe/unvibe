import { ModelConfig } from './_shared-types';

export const MODEL_CONFIG: ModelConfig = {
  id: 'moonshot-v1-128k',
  displayName: 'V1 128k',
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
