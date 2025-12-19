import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Payload to authenticate a user with username and password.
 */
export class LoginDto {
  /**
   * Username previously used during registration.
   */
  @IsString()
  @IsNotEmpty()
  username: string;

  /**
   * Plain-text password (will be verified against stored hash).
   */
  @IsString()
  @MinLength(4)
  password: string;
}
