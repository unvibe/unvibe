import { MakeTool } from '@/plugins/_types';
import { VirtualFile } from '@/plugins/_types/plugin.server';

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

export type UIEntryPoint = {
  path: string;
  file: string;
};

export interface BaseProject {
  path: string;
  size: number;
  paths: string[];
  plugins: Record<string, ProjectPlugin>;
  context_config: Record<string, boolean>;
  context_preview: { key: string; preview_string: string }[];
  registeredStructuredOutput: {
    key: string;
    description: string;
    // ? -----------------------------------------------------------------------
    // ? theses two function are not serializable, so we use them only in server
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve?: (data: any, source: VirtualFile[]) => Promise<VirtualFile[]>;
    apply?: (
      project: BaseProject,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any,
      selections: { path: string; selected: boolean }[],
      resolved?: VirtualFile[]
    ) => Promise<{ path: string; status: 'success' | 'error' }[]>;
    // ? -----------------------------------------------------------------------
    resolvable: boolean;
    applyable: boolean;
  }[];
  UIEntryPoints: Record<string /* plugin.id */, UIEntryPoint[]>;
  // -- remove later
  EXPENSIVE_REFACTOR_LATER_content: Record<string, string>;
}

export type Project = BaseProject;
