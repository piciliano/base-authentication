import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { env } from 'src/config/env';

@Module({
  imports: [
    NestJwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION },
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
