import type { RegisterDto } from '../../auth/dto/register.dto';
import type { LoginDto } from '../../auth/dto/login.dto';
import type { UserEntity } from '../../infra/postgres/entities/user.entity';

/**
 * Port for authentication: user registration, login and profile echo.
 */
export interface IAuthService {
  /**
   * Create a new user and return a signed JWT together with the user entity.
   */
  register(dto: RegisterDto): Promise<{ token: string; user: UserEntity }>;
  /**
   * Validate credentials and return a signed JWT together with the user entity.
   */
  login(dto: LoginDto): Promise<{ token: string; user: UserEntity }>;
  /**
   * Echo endpoint returning the parsed user payload from JWT.
   */
  me(user: { id: string; username: string; role: 'admin' | 'user' }): {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');
