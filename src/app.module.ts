import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HashModule } from './hash/hash.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './auth/jwt/jwt.module';

@Module({
  imports: [PrismaModule, UserModule, HashModule, AuthModule, JwtModule],
})
export class AppModule {}
