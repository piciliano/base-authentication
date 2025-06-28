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

    const refreshToken = await this.prisma.refreshToken.create({
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

    res.cookie('refreshToken', `${refreshToken.id}:${refreshTokenRaw}`, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.REFRESH_TOKEN_EXPIRATION,
      path: '/',
    });

    return { message: 'Login successful' };
  }

  public async refreshTokens(req: Request, res: Response) {
    const cookie = req.cookies['refreshToken'];
    if (!cookie) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const [refreshTokenId, refreshTokenValue] = cookie.split(':');
    if (!refreshTokenId || !refreshTokenValue) {
      throw new UnauthorizedException('Invalid refresh token format');
    }

    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { id: refreshTokenId },
      include: { user: true },
    });
    if (!tokenRecord) throw new UnauthorizedException('Invalid refresh token');

    const isMatch = await this.hashService.verify(
      tokenRecord.tokenHash,
      refreshTokenValue,
    );
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    const user = tokenRecord.user;
    if (!user) throw new UnauthorizedException('User not found');

    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: env.JWT_EXPIRATION,
    });

    const newRefreshTokenRaw = randomBytes(32).toString('hex');
    const newRefreshTokenHash = await this.hashService.hash(newRefreshTokenRaw);
    const newRefreshExpiresAt = new Date(
      Date.now() + Number(env.REFRESH_TOKEN_EXPIRATION),
    );

    const newRefreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: newRefreshExpiresAt,
      },
    });

    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.COOKIE_EXPIRATION,
      path: '/',
    });

    res.cookie('refreshToken', `${newRefreshToken.id}:${newRefreshTokenRaw}`, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.REFRESH_TOKEN_EXPIRATION,
      path: '/',
    });

    return { message: 'Token refreshed' };
  }

  public async logout(res: Response, userId?: string) {
    if (userId) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }

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
