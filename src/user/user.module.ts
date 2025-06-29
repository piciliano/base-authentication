import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '../auth/jwt/jwt.module';

@Module({
  imports: [AuthModule, JwtModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
