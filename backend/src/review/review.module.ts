import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyReviewsController, ReviewsController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CompanyReviewsController, ReviewsController],
  providers: [ReviewService],
})
export class ReviewModule {}
