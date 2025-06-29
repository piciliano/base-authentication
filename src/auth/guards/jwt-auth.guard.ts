import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { HashService } from 'src/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { env } from 'src/config/env';
import { CurrentUserType } from '../types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    try {
      // Tenta autenticar normalmente
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (err) {
      // Se falhou por expiração, tenta refresh automático
      const refreshCookie = request.cookies['refreshToken'];
      if (!refreshCookie) throw new UnauthorizedException('Missing refresh token');
      try {
        // Usa o método centralizado do AuthService para refresh
        await this.authService.refreshTokens(request, response);
        // Após refresh, tenta autenticar novamente
        const result = await super.canActivate(context);
        return result as boolean;
      } catch (refreshErr) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
    }
  }
}
