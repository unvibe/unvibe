import { StructuredOutput } from '@/server/llm/structured_output';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export interface StructuredOutputContextValue {
  data: StructuredOutput;
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
  data: StructuredOutput;
}) {
  const [selection, setSelection] = useState<
    StructuredOutputContextValue['selection']
  >(() => {
    const replace = data.replace_files || [];
    const remove = data.delete_files || [];
    const edit = data.edit_files || [];
    const ranges = data.edit_ranges || [];
    const scripts = data.shell_scripts || [];
    return [
      ...replace.map((file) => ({ path: file.path, selected: true })),
      ...remove.map((file) => ({ path: file.path, selected: true })),
      ...edit.map((file) => ({ path: file.path, selected: true })),
      ...ranges.map((range) => ({ path: range.path, selected: true })),
      ...scripts.map((script) => ({ path: script, selected: true })),
    ];
  });
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
