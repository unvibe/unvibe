export interface StructuredChatMessage<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  ts: number;
  id: string;
  type: 'json';
  content: T;
}
