import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import type { IAuthService } from '../core/ports/auth.service.port';
import type { IUsersService } from '../core/ports/users.service.port';
import { USERS_SERVICE } from '../core/tokens';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService
 *
 * Provides user registration and authentication using JWT tokens
 * and simple username/password credentials managed by UsersService.
 */
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: IUsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user and issue a JWT.
   * - Throws ConflictException if the username is already taken.
   * @param dto Registration payload
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByName(dto.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = await this.usersService.create(dto.username, dto.password, 'user');
    const payload = { sub: user.id, username: user.name, role: user.role } as const;
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  /**
   * Authenticate an existing user by username and password.
   * - Throws UnauthorizedException on invalid credentials.
   * @param dto Login payload
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.validateUserByName(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.name, role: user.role } as const;
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  /**
   * Return the JWT user payload as-is (used by /auth/me).
   */
  me(user: { id: string; username: string; role: 'admin' | 'user' }) {
    return user;
  }
}
