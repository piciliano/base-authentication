import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
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
    if (!token) return next();

    try {
      this.jwtService.verify(token, { secret: env.JWT_SECRET });
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        await this.authService.refreshTokens(req, res);
        return next();
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
