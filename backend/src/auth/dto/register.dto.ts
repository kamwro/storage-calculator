import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Unique username used for login', example: 'demo@example.com' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Plain-text password (minimum 8 characters)', example: 'demo1234' })
  @IsString()
  @MinLength(8)
  password: string;
}
