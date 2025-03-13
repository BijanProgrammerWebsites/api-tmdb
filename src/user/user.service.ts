import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ResponseDto } from '../shared/dto/response.dto';

import { UpdateDto } from './dto/update.dto';

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
      },
    };
  }

  public async update(dto: UpdateDto): Promise<ResponseDto> {
    await this.userRepository.update({ username: dto.username }, dto);

    return {
      statusCode: 200,
      message: 'User updated successfully.',
    };
  }
}
