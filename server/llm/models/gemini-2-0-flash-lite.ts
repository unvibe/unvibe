import { ModelConfig } from './_shared-types';

const GEMINI_FLASH_2_0_FLASH = 'gemini-2.0-flash-lite';

export const MODEL_CONFIG: ModelConfig = {
  id: GEMINI_FLASH_2_0_FLASH,
  displayName: 'Gemini 2.0 Flash Lite',
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
    search: true,
  },
  pricing: {
    in: 0.1,
    inCached: 0.025,
    out: 0.4,
  },
  defaultRunner: 'google',
};
