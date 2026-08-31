import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { AiCompletion, AiMessage } from './ai-provider.interface';

interface ChatCompletionResponse {
  model?: unknown;
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
  error?: {
    message?: unknown;
    code?: unknown;
  };
}

interface CompletionOptions {
  apiKey: string;
  endpoint: string;
  model: string;
  timeoutMs: number;
  messages: AiMessage[];
}

export async function requestChatCompletion(options: CompletionOptions): Promise<AiCompletion> {
  if (!options.apiKey) {
    throw new ServiceUnavailableException({
      code: 'AI_PROVIDER_NOT_CONFIGURED',
      message: 'AI 服务尚未配置 API Key',
      details: {},
    });
  }

  try {
    const response = await fetch(options.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: false,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(options.timeoutMs),
    });
    const payload = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      throw new BadGatewayException({
        code: 'AI_PROVIDER_ERROR',
        message: 'AI 服务暂时不可用',
        details: {
          providerStatus: response.status,
          providerCode: typeof payload.error?.code === 'string' ? payload.error.code : undefined,
        },
      });
    }

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new BadGatewayException({
        code: 'AI_EMPTY_RESPONSE',
        message: 'AI 服务返回了空结果',
        details: {},
      });
    }

    return {
      content: content.trim(),
      model: typeof payload.model === 'string' ? payload.model : options.model,
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new HttpException(
        {
          code: 'AI_PROVIDER_TIMEOUT',
          message: 'AI 服务响应超时，请稍后重试',
          details: {},
        },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }
    throw new BadGatewayException({
      code: 'AI_PROVIDER_UNAVAILABLE',
      message: '无法连接 AI 服务，请稍后重试',
      details: {},
    });
  }
}
