import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { ResponseDto } from '../shared/dto/response.dto';

import { UpdateDto } from './dto/update.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

import { User } from './user.entity';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async info(
    user: User,
  ): Promise<ResponseDto<Omit<User, 'password' | 'refreshToken'>>> {
    return {
      statusCode: 200,
      message: 'User fetched successfully.',
      result: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: user.dob,
        selections: user.selections,
      },
    };
  }

  public async update(user: User, dto: UpdateDto): Promise<ResponseDto> {
    await this.userRepository.update({ id: user.id }, dto);

    return {
      statusCode: 200,
      message: 'User updated successfully.',
    };
  }

  public async updatePassword(
    user: User,
    dto: UpdatePasswordDto,
  ): Promise<ResponseDto> {
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is wrong.');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    await this.userRepository.update(
      { id: user.id },
      { password: hashedPassword },
    );

    return {
      statusCode: 200,
      message: 'Password updated successfully.',
    };
  }
}
