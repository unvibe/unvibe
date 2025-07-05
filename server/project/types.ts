import { MakeTool } from '@/plugins/_types';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';

export interface ProjectPlugin {
  id: string;
  info: Record<string, string>;
  tools: ReturnType<MakeTool>[];
  sourceCodeHooks: {
    name: string;
    rule: string;
    operations: {
      diagnostic: boolean;
      trasnform: boolean;
    };
  }[];
}

export interface BaseProject {
  path: string;
  size: number;
  paths: string[];
  plugins: Record<string, ProjectPlugin>;
  context_config: Record<string, boolean>;
  context_preview: { key: string; preview_string: string }[];
  // -- remove later
  EXPENSIVE_REFACTOR_LATER_content: Record<string, string>;
}

export type Project = BaseProject;
