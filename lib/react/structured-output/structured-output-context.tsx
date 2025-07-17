import { StructuredOutput } from '@/server/llm/structured_output';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export type SelectionItem = {
  path: string;
  selected: boolean;
};
// New type for granular selection matching proposal structure
export type ProposalSelection = {
  replace_files?: { path: string; selected: boolean }[];
  delete_files?: { path: string; selected: boolean }[];
  shell_scripts?: { script: string; selected: boolean }[];
  codemod_scripts?: { path: string; selected: boolean }[];
  find_and_replace?: { path: string; selected: boolean }[];
  patch_files?: { path: string; selected: boolean }[];
  find_and_replace_files?: { path: string; selected: boolean }[];
  edit_instructions?: { path: string; selected: boolean }[];
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
    const scripts = data.shell_scripts || [];
    const codemods = data.codemod_scripts || [];
    const findAndReplace = data.find_and_replace || [];
    const editInstructions = data.edit_instructions || [];
    return {
      replace_files: replace.map((file) => ({
        path: file.path,
        selected: true,
      })),
      delete_files: remove.map((file) => ({ path: file.path, selected: true })),
      shell_scripts: scripts.map((script) => ({ script, selected: true })),
      codemod_scripts: codemods.map((script) => ({
        path: script.path,
        selected: true,
      })),
      find_and_replace: findAndReplace.map((fr) => ({
        path: fr.path,
        selected: true,
      })),
      edit_instructions: editInstructions.map((instruction) => ({
        path: instruction.path,
        selected: true,
      })),
    };
  });
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
