import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiController } from './ai.controller';
import { AiRateLimitGuard } from './ai-rate-limit.guard';
import { AiService } from './ai.service';
import { AI_PROVIDER, type AiProvider } from './providers/ai-provider.interface';
import { DoubaoProvider } from './providers/doubao.provider';
import { QianwenProvider } from './providers/qianwen.provider';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiRateLimitGuard,
    DoubaoProvider,
    QianwenProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, DoubaoProvider, QianwenProvider],
      useFactory: (
        config: ConfigService,
        doubao: DoubaoProvider,
        qianwen: QianwenProvider,
      ): AiProvider => {
        return config.getOrThrow<string>('ai.provider') === 'qianwen' ? qianwen : doubao;
      },
    },
  ],
})
export class AiModule {}
