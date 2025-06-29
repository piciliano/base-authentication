import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { env } from 'src/config/env';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['jwt'];

    if (!token) {
      return next();
    }

    try {
      this.jwtService.verify(token, { secret: env.JWT_SECRET });
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        try {
          await this.authService.refreshTokens(req, res);
          return next();
        } catch (refreshError) {
          res.clearCookie('jwt', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
          res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
          return next();
        }
      }

      res.clearCookie('jwt', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return next();
    }
  }
}
