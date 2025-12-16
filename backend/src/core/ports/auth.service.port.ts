import type { RegisterDto } from '../../auth/dto/register.dto';
import type { LoginDto } from '../../auth/dto/login.dto';
import type { UserEntity } from '../../infra/postgres/entities/user.entity';

export interface IAuthService {
  register(dto: RegisterDto): Promise<{ token: string; user: UserEntity }>;
  login(dto: LoginDto): Promise<{ token: string; user: UserEntity }>;
  me(user: { id: string; username: string; role: 'admin' | 'user' }): {
    id: string;
    username: string;
    role: 'admin' | 'user';
  };
}

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');
