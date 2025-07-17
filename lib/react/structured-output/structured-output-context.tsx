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
export type ProposalSelection = Record<
  string,
  { path: string; selected: boolean }[]
>;

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

const DEFAULT_SELECTION: ProposalSelection = {};

export function StructuredOutputContextProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: StructuredOutput;
}) {
  // Initialize selection state based on proposal structure
  const [selection, setSelection] =
    useState<ProposalSelection>(DEFAULT_SELECTION);
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
