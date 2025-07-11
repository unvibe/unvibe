import { StructuredOutput } from '@/server/llm/structured_output';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

// New type for granular selection matching proposal structure
export type ProposalSelection = {
  replace_files?: { path: string; selected: boolean }[];
  delete_files?: { path: string; selected: boolean }[];
  edit_files?: { path: string; selected: boolean }[];
  edit_ranges?: { path: string; selected: boolean }[];
  shell_scripts?: { script: string; selected: boolean }[];
};

export interface StructuredOutputContextValue {
  data: StructuredOutput;
  selection: ProposalSelection;
  setSelection: Dispatch<SetStateAction<ProposalSelection>>;
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
  data: StructuredOutput;
}) {
  // Initialize selection state based on proposal structure
  const [selection, setSelection] = useState<ProposalSelection>(() => {
    const replace = data.replace_files || [];
    const remove = data.delete_files || [];
    const edit = data.edit_files || [];
    const ranges = data.edit_ranges || [];
    const scripts = data.shell_scripts || [];
    return {
      replace_files: replace.map((file) => ({
        path: file.path,
        selected: true,
      })),
      delete_files: remove.map((file) => ({ path: file.path, selected: true })),
      edit_files: edit.map((file) => ({ path: file.path, selected: true })),
      edit_ranges: ranges.map((range) => ({
        path: range.path,
        selected: true,
      })),
      shell_scripts: scripts.map((script) => ({ script, selected: true })),
    };
  });
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
