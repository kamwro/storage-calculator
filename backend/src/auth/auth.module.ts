import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AUTH_SERVICE } from '../core/tokens';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, { provide: AUTH_SERVICE, useExisting: AuthService }, JwtStrategy],
  controllers: [AuthController],
  exports: [AUTH_SERVICE],
})
export class AuthModule {}
