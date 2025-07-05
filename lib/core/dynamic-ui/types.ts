import { Project } from '@/server/project/types';

type DynamicUIText = {
  type: 'text';
  autocomplete?: string[];
};

type DynamicUIMultilineText = {
  type: 'multiline-text';
};

type DynamicUISelect = {
  type: 'select';
  options: { label: string; value: string }[];
};

type DynamicUINumber = {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

type DynamicUISwitch = {
  type: 'boolean';
};

type DynamicUIRange = {
  type: 'range';
  min?: number;
  max?: number;
  step?: number;
};

export type DynamicUIEntry =
  | DynamicUIMultilineText
  | DynamicUIText
  | DynamicUISelect
  | DynamicUINumber
  | DynamicUISwitch
  | DynamicUIRange;

export type DynamicUICallback = (project: Project) => DynamicUIEntry;

export function defineUI(
  elementOrCallback: Record<
    string,
    DynamicUIEntry | ((project: Project) => DynamicUIEntry)
  >
) {
  return elementOrCallback;
}
