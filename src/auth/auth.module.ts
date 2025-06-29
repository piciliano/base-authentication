import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt/jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { HashModule } from 'src/hash/hash.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PrismaService } from 'prisma/prisma.service';
import { HashService } from 'src/hash/hash.service';

@Module({
  imports: [JwtModule, PrismaModule, HashModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, PrismaService, HashService],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
