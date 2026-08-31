import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IdParamDto } from '../common/dto/id-param.dto';
import { AiRateLimitGuard } from './ai-rate-limit.guard';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { InterviewDto } from './dto/interview.dto';
import { ResumeReviewDto } from './dto/resume-review.dto';

@ApiTags('AI assistant')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI 职场咨询对话' })
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto);
  }

  @Post('company-analysis/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AiRateLimitGuard)
  @ApiOperation({ summary: '根据企业信息、评价和评分生成智能分析' })
  analyzeCompany(@Param() params: IdParamDto) {
    return this.aiService.analyzeCompany(params.id);
  }

  @Post('resume-review')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AiRateLimitGuard)
  @ApiOperation({ summary: 'AI 简历评审' })
  reviewResume(@Body() dto: ResumeReviewDto) {
    return this.aiService.reviewResume(dto);
  }

  @Post('interview')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, AiRateLimitGuard)
  @ApiOperation({ summary: '生成模拟面试题或评估用户回答' })
  interview(@Body() dto: InterviewDto) {
    return this.aiService.interview(dto);
  }
}
