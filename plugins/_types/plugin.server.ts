import { BaseProject } from '@/server/project/types';
import { DynamicUICallback, DynamicUIEntry } from '@/lib/core/dynamic-ui/types';
import { CreateTool, ToolConfig, ToolParametersDefinition } from './tools';

export type VirtualFile = { path: string; content: string };

type VFS = VirtualFile[];

export type Diagnostic = (vfs: VFS, path: string) => Promise<string>;
export type Transform = (vfs: VFS, path: string) => Promise<VFS>;

// -- theses are used to narrow down the type of the hook
export type SourceCodeDiagnosticHook = {
  name: string;
  rule: RegExp;
  operations: {
    diagnostic: Diagnostic;
    transform?: Transform;
  };
};
export type SourceCodeTransformHook = {
  name: string;
  rule: RegExp;
  operations: {
    transform: Transform;
    diagnostic?: Diagnostic;
  };
};
// --

export type SourceCodeHook = {
  name: string;
  rule: RegExp;
  operations: {
    diagnostic?: Diagnostic;
    transform?: Transform;
  };
};

export type LLMToolModule = {
  config: ToolConfig<ToolParametersDefinition>;
  createTool: CreateTool;
  render?: Record<string, DynamicUIEntry | DynamicUICallback>;
};

export type ServerPlugin = {
  description: string;
  id: string;
  detect: (baseProject: BaseProject) => Promise<boolean>;
  createContext: (baseProject: BaseProject) => Promise<{
    tools: Record<string, LLMToolModule>;
    systemParts: Record<string, string>;
    structuredOutput?: {
      key: string;
      instructions: string;
      resolveFiles?: (data: unknown) => Promise<VirtualFile[]>;
    }[];
  }>;
  sourceCodeHooks?: SourceCodeHook[];
};
