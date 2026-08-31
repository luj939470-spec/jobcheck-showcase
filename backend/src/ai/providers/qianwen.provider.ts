import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiCompletion, AiMessage, AiProvider } from './ai-provider.interface';
import { requestChatCompletion } from './openai-compatible.client';

@Injectable()
export class QianwenProvider implements AiProvider {
  constructor(private readonly config: ConfigService) {}

  complete(messages: AiMessage[]): Promise<AiCompletion> {
    return requestChatCompletion({
      apiKey: this.config.getOrThrow<string>('ai.qianwen.apiKey'),
      endpoint: this.config.getOrThrow<string>('ai.qianwen.endpoint'),
      model: this.config.getOrThrow<string>('ai.qianwen.model'),
      timeoutMs: this.config.getOrThrow<number>('ai.timeoutMs'),
      messages,
    });
  }
}
