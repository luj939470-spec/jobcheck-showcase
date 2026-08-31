export type AiMessageRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
  role: AiMessageRole;
  content: string;
}

export interface AiCompletion {
  content: string;
  model: string;
}

export interface AiProvider {
  complete(messages: AiMessage[]): Promise<AiCompletion>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
