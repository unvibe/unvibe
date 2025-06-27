import { Project } from '../core/server/api/lib/project';
import { ToolDefinition } from '@/server/llm/models/_shared-types';
import { JSONSchema7 } from 'json-schema';

export type ToolParametersDefinition = JSONSchema7['properties'];

export interface ToolConfig<TParams extends ToolParametersDefinition> {
  usage: string;
  name: string;
  description: string;
  parameters: TParams;
}

export type MakeTool = <T extends ToolParametersDefinition>(
  config: ToolConfig<T>
) => ToolConfig<T>;

export function make<T extends ToolParametersDefinition>(
  config: ToolConfig<T>
) {
  return config;
}

export type CreateTool = (config: { project: Project }) => ToolDefinition;
