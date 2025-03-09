import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { Request, Response } from 'express';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignOutDto } from './dto/sign-out.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { JwtPayloadType } from './types/jwt-payload.type';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  public constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Post('sign-up')
  public signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(dto, res);
  }

  @Post('sign-in')
  public signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signIn(dto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  public signOut(
    @Body() dto: SignOutDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signOut(dto, res);
  }

  @Get('refresh')
  public refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayloadType>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const userId = payload.sub;

      if (!userId) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      return this.authService.refresh(userId, refreshToken, res);
    } catch {
      this.authService.clearCookies(res);
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }
}
