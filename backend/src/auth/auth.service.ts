import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  register(dto: RegisterDto) {
    const existing = this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = this.usersService.create(dto.username, dto.password);
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  login(dto: LoginDto) {
    const user = this.usersService.validateUser(dto.username, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    const token = this.jwtService.sign(payload);
    return { token, user };
  }

  me(user: { id: number; username: string }) {
    return user;
  }
}
