import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { env } from 'src/config/env';
import { JwtPayload, CurrentUserType } from '../types';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies) return null;
        return (req.cookies['jwt'] as string) || null;
      },
      secretOrKey: env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): CurrentUserType {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
