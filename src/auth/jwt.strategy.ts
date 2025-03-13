import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';

import { Repository } from 'typeorm';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../user/user.entity';

import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayloadType): Promise<User> {
    const { sub } = payload;

    const foundUser = await this.userRepository.findOne({ where: { id: sub } });

    if (!foundUser) {
      throw new UnauthorizedException('User not found.');
    }

    return foundUser;
  }
}
