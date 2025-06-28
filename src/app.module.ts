import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HashModule } from './hash/hash.module';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenMiddleware } from './auth/refresh-token.middleware';
import { JwtModule } from './auth/jwt/jwt.module';

@Module({
  imports: [PrismaModule, UserModule, HashModule, AuthModule, JwtModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RefreshTokenMiddleware)
      .forRoutes({ path: 'auth/me', method: RequestMethod.GET });
  }
}
