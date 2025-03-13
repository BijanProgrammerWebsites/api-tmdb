import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Response } from 'express';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ResponseDto } from '../shared/dto/response.dto';

import { User } from '../user/user.entity';

import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async signUp(dto: SignUpDto, res: Response): Promise<ResponseDto> {
    const { username, password } = dto;

    const foundUser = await this.userRepository.findOne({
      where: { username },
    });

    if (foundUser) {
      throw new ConflictException('Username already taken.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);

      await this.generateTokensAndSetCookies(user, res);

      return {
        statusCode: 200,
        message: 'Signed up successfully.',
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  public async signIn(dto: SignInDto, res: Response): Promise<ResponseDto> {
    const { username, password } = dto;

    const foundUser = await this.userRepository.findOne({
      where: { username },
    });

    if (!foundUser) {
      throw new UnauthorizedException('Username not found.');
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong.');
    }

    await this.generateTokensAndSetCookies(foundUser, res);

    return {
      statusCode: 200,
      message: 'Signed in successfully.',
    };
  }

  public async signOut(userId: string, res: Response): Promise<ResponseDto> {
    await this.userRepository.update(userId, { refreshToken: null });

    this.clearCookies(res);

    return {
      statusCode: 200,
      message: 'Signed out successfully.',
    };
  }

  public valid(): ResponseDto {
    return {
      statusCode: 200,
      message: 'Authenticated.',
    };
  }

  public async refresh(
    userId: string,
    refreshToken: string,
    res: Response,
  ): Promise<ResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!foundUser || !foundUser.refreshToken) {
      throw new UnauthorizedException('Invalid session.');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      foundUser.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid session.');
    }

    const accessToken = this.generateAccessToken(foundUser);
    this.setAccessTokenCookie(res, accessToken);

    return { statusCode: 200, message: 'Access token refreshed.' };
  }

  public clearCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  private async generateTokensAndSetCookies(
    user: User,
    res: Response,
  ): Promise<void> {
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    await this.updateRefreshToken(user.id, newRefreshToken);

    this.setCookies(res, accessToken, newRefreshToken);
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayloadType = { sub: user.id, username: user.username };

    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: User): string {
    const payload: JwtPayloadType = { sub: user.id, username: user.username };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    });
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const salt = await bcrypt.genSalt();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  private setAccessTokenCookie(res: Response, accessToken: string): void {
    const expiration = new Date();

    expiration.setSeconds(
      expiration.getSeconds() +
        this.configService.get<number>('JWT_COOKIE_EXPIRATION_SECONDS')!,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      expires: expiration,
      sameSite: 'none',
      path: '/',
    });
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    const expiration = new Date();

    expiration.setSeconds(
      expiration.getSeconds() +
        this.configService.get<number>(
          'JWT_REFRESH_COOKIE_EXPIRATION_SECONDS',
        )!,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      expires: expiration,
      sameSite: 'none',
      path: '/tmdb/auth/refresh',
    });
  }
}
