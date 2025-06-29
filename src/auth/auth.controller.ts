import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './schema/create-auth.schema';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CurrentUserType } from './types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.handleLogin(createAuthDto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: CurrentUserType) {
    return this.authService.getUserProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.authService.logout(res, user.userId);
  }
}
