import { Controller, Post, Body, Res, UseGuards, Get, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './schema/create-auth.schema';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
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

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshTokens(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getUserProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { userId: string },
  ) {
    return this.authService.logout(res, user.userId);
  }
}
