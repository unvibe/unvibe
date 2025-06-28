import { useParams } from '@/lib/next/navigation';
import { useAPIQuery } from '@/server/api/client';
import { ModelResponseStructure } from '@/server/llm/structured_output';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export interface StructuredOutputContextValue {
  data: ModelResponseStructure;
  selection: { path: string; selected: boolean }[];
  setSelection: Dispatch<
    SetStateAction<StructuredOutputContextValue['selection']>
  >;
}

export const StructuredOutputContext =
  createContext<StructuredOutputContextValue | null>(null);

export function useStructuredOutputContext() {
  return useContext(StructuredOutputContext) as StructuredOutputContextValue;
}

export function StructuredOutputContextProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: ModelResponseStructure;
}) {
  const projectId = useParams().project_id as string;
  const { data: diagnostics } = useAPIQuery('POST /projects/diagnose', {
    projectDirname: projectId,
    source: 'projects',
    proposal: data,
  });

  console.log({
    diagnostics,
    data,
  });
  const [selection, setSelection] = useState<
    StructuredOutputContextValue['selection']
  >(() => {
    const replace = data.replace_files || [];
    const remove = data.delete_files || [];
    const edit = data.edit_files || [];
    const scripts = data.shell_scripts || [];
    return [
      ...replace.map((file) => ({ path: file.path, selected: true })),
      ...remove.map((file) => ({ path: file.path, selected: true })),
      ...edit.map((file) => ({ path: file.path, selected: true })),
      ...scripts.map((script) => ({ path: script, selected: true })),
    ];
  });
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
