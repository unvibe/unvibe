import { ModelConfig } from './_shared-types';

const GEMINI_FLASH_2_5_FLASH_PREVIEW_04_17 = 'gemini-2.5-flash-preview-04-17';

export const MODEL_CONFIG: ModelConfig = {
  id: GEMINI_FLASH_2_5_FLASH_PREVIEW_04_17,
  displayName: 'Gemini 2.5 Flash (Preview)',
  pricing: {
    in: 0.1,
    inCached: 0.025,
    out: 0.4,
  },
  supports: {
    text: true,
    image: true,
    tools: true,
    json: true,
    search: true,
  },
  defaultRunner: 'google',
};
