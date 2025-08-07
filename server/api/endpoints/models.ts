import { createEndpoint } from '../create-endpoint';
import * as llm from '@/server/llm';

// Map runner id to provider name
const runnerProviderMap: Record<string, string> = {
  'openai-chat-completions': 'OpenAI',
  'ollama': 'Ollama',
  'anthropic': 'Anthropic',
  'google': 'Google',
};

const apiKeyProviderMap: Record<string, string> = {
  OPENAI_API_KEY: 'OpenAI',
  GOOGLE_API_KEY: 'Google',
  ANTHROPIC_API_KEY: 'Anthropic',
  OLLAMA_ENABLED: 'Ollama',
};

export const listModels = createEndpoint({
  type: 'GET',
  pathname: '/models',
  handler: async () => {
    return {
      DEFAULT_MODEL: llm.models.GPT5Mini,
      raw: llm.models,
      runnerProviderMap,
      apiKeyProviderMap,
      models: Object.values(llm.models).map((model) => {
        const runner = model.MODEL_CONFIG.defaultRunner;
        return {
          id: model.MODEL_CONFIG.id,
          displayName: model.MODEL_CONFIG.displayName,
          pricing: model.MODEL_CONFIG.pricing,
          provider: runnerProviderMap[runner] || runner || 'Unknown',
        };
      }),
    };
  },
});
