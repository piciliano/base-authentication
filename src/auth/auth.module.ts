import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { HashModule } from 'src/hash/hash.module';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [JwtModule, PrismaModule, HashModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
