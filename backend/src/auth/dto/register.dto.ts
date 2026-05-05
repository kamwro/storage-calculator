import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Payload to register a new user account.
 */
export class RegisterDto {
  /**
   * Unique username used for login.
   * - must be a non-empty string
   */
  @IsString()
  @IsNotEmpty()
  username: string;

  /**
   * Plain-text password to be hashed server-side.
   * - minimum length: 8 characters
   */
  @IsString()
  @MinLength(8)
  password: string;
}
