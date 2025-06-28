import { AssistantMessageActions } from './assistant-message-actions';
import { useAssistantMessageContext } from '../assistant-message-context';

export function StructuredOutputActions() {
  const value = useAssistantMessageContext();

  if (value.metadata.type !== 'structured' || !value.metadata.showAction) {
    return null;
  }

  return <AssistantMessageActions />;
}
