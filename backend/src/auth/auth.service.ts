import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import type { IAuthService } from '../core/ports/auth.service.port';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(dto: LoginDto) {
    const user = await this.usersService.validateUserByName(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.name, role: user.role } as const;
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  me(user: { id: string; username: string; role: 'admin' | 'user' }) {
    return user;
  }
}
