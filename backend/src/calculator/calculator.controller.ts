import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EvaluateRequestDto } from './dto/evaluate.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthenticatedRequest } from '../shared/auth/types';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('evaluate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  evaluate(@Body() dto: EvaluateRequestDto, @Req() req: AuthenticatedRequest) {
    return this.calculatorService.evaluate(dto, req.user);
  }
}
