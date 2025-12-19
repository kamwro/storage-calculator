import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EvaluateRequestDto } from './dto/evaluate.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * CalculatorController
 *
 * Exposes endpoints to evaluate packing strategies across containers
 * for the authenticated user.
 */
@Controller('calculator')
@ApiTags('Calculator')
@ApiBearerAuth()
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('evaluate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Evaluate packing strategy for provided items and containers' })
  @ApiBody({ type: EvaluateRequestDto })
  @ApiResponse({ status: 200, description: 'Evaluation result with allocation and utilization' })
  evaluate(@Body() dto: EvaluateRequestDto, @Req() req: AuthenticatedRequest) {
    return this.calculatorService.evaluate(dto, req.user);
  }
}
