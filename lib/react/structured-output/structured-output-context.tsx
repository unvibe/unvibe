import { StructuredOutput } from '@/server/llm/structured_output';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { useProject } from '~/modules/project/provider';

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
  defaultState,
}: {
  children: React.ReactNode;
  data: StructuredOutput;
  defaultState?: ProposalSelection;
}) {
  const project = useProject();
  const registeredStructuredOutput = project.registeredStructuredOutput || [];
  // Initialize selection state based on proposal structure
  const [selection, setSelection] = useState<ProposalSelection>(
    defaultState || DEFAULT_SELECTION
  );

  console.log(
    Object.keys(data),
    registeredStructuredOutput.filter(({ key }) => key in data)
  );
  return (
    <StructuredOutputContext.Provider value={{ data, selection, setSelection }}>
      {children}
    </StructuredOutputContext.Provider>
  );
}
