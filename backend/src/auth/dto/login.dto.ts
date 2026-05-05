import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Username used during registration', example: 'demo@example.com' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Plain-text password', example: 'demo1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
