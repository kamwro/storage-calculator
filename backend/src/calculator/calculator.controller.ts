import { Body, Controller, Post } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { EvaluateRequestDto } from './dto/evaluate.dto';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('evaluate')
  evaluate(@Body() dto: EvaluateRequestDto) {
    return this.calculatorService.evaluate(dto);
  }
}
