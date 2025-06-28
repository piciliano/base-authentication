import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { CreateAuthDto } from './schema/create-auth.schema';
import { HashService } from 'src/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { env } from 'src/config/env';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
    private jwtService: JwtService,
  ) {}

  async handleLogin(dto: CreateAuthDto, res: Response) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await this.hashService.verify(
      user.password!,
      password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: env.JWT_EXPIRATION,
    });

    const refreshTokenRaw = randomBytes(32).toString('hex');
    const refreshTokenHash = await this.hashService.hash(refreshTokenRaw);
    const refreshExpiresAt = new Date(
      Date.now() + Number(env.REFRESH_TOKEN_EXPIRATION),
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.COOKIE_EXPIRATION,
      path: '/',
    });

    res.cookie('refreshToken', refreshTokenRaw, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.REFRESH_TOKEN_EXPIRATION,
      path: '/',
    });

    return { message: 'Login successful' };
  }

  public async refreshTokens(req: Request, res: Response) {
    const token = req.cookies['refreshToken'];
    if (!token) throw new UnauthorizedException('Missing refresh token');

    const tokens = await this.prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    const match = await Promise.any(
      tokens.map(async (t) => {
        const isMatch = await this.hashService.verify(t.tokenHash, token);
        return isMatch ? t : Promise.reject();
      }),
    ).catch(() => null);

    if (!match) throw new UnauthorizedException('Invalid refresh token');

    const user = match.user;
    if (!user) throw new UnauthorizedException('User not found');

    const payload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: env.JWT_EXPIRATION,
    });

    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.COOKIE_EXPIRATION,
      path: '/',
    });

    return { message: 'Token refreshed' };
  }

  public async logout(res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logout successful' };
  }

  public async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
