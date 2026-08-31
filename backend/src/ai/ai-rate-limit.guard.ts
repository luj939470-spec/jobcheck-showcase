import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class AiRateLimitGuard implements CanActivate {
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const now = Date.now();
    const windowMs = this.config.getOrThrow<number>('ai.rateLimit.windowMs');
    const max = this.config.getOrThrow<number>('ai.rateLimit.max');
    const existing = this.entries.get(request.user.id);

    if (!existing || existing.resetAt <= now) {
      this.entries.set(request.user.id, { count: 1, resetAt: now + windowMs });
      this.prune(now);
      return true;
    }

    if (existing.count >= max) {
      throw new HttpException(
        {
          code: 'AI_RATE_LIMIT_EXCEEDED',
          message: 'AI 请求过于频繁，请稍后重试',
          details: { retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    return true;
  }

  private prune(now: number): void {
    if (this.entries.size < 1000) {
      return;
    }
    for (const [key, value] of this.entries) {
      if (value.resetAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}
