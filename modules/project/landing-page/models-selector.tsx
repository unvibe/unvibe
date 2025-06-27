import React from 'react';
import { Select, SelectOption, SelectGroup } from '../../ui/select';
import {
  SiAnthropic,
  SiGooglegemini,
  SiOllama,
  SiOpenai,
} from 'react-icons/si';

// Example icon mapping per provider
const providerIcons: Record<string, React.ReactNode> = {
  OpenAI: (
    <span role='img' aria-label='OpenAI'>
      <SiOpenai className='w-4 h-4' />
    </span>
  ),
  Anthropic: (
    <span role='img' aria-label='Anthropic'>
      <SiAnthropic className='w-4 h-4' />
    </span>
  ),
  Google: (
    <span role='img' aria-label='Google'>
      <SiGooglegemini className='w-4 h-4' />
    </span>
  ),
  Ollama: (
    <span role='img' aria-label='Ollama'>
      <SiOllama className='w-4 h-4' />
    </span>
  ),
  // Add more mappings as desired
};

interface ModelPricing {
  in: number;
  inCached: number;
  out: number;
}

interface Model {
  id: string;
  displayName: string;
  provider: string;
  pricing?: ModelPricing;
}

function groupModelsByProvider(models: Model[]): SelectGroup[] {
  const groups: { [provider: string]: SelectOption[] } = {};
  for (const model of models) {
    if (!groups[model.provider]) groups[model.provider] = [];
    groups[model.provider].push({
      value: model.id,
      label: model.displayName,
    });
  }
  return Object.entries(groups).map(([provider, options]) => ({
    label: provider,
    options,
    icon: providerIcons[provider] || undefined,
  }));
}

export const ModelsSelector: React.FC<{
  value?: string;
  onChange?: (modelId: string) => void;
  models?: Model[];
}> = ({ value, onChange, models }) => {
  const groupedOptions = groupModelsByProvider(models || []);

  return (
    <Select
      value={value ? value : undefined}
      onChange={onChange}
      options={groupedOptions}
      placeholder='Select a model'
      style={{ minWidth: 200 }}
    />
  );
};

export default ModelsSelector;
