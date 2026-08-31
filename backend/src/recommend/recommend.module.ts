import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendController],
  providers: [RecommendService],
})
export class RecommendModule {}
