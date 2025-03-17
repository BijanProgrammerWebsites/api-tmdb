import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../user/user.entity';

import { CreateDto } from './dto/create.dto';

import { Selection } from './selection.entity';

@Injectable()
export class SelectionService {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Selection)
    private selectionRepository: Repository<Selection>,
  ) {}

  public async findAll(user: User): Promise<any> {
    return await this.selectionRepository.find({
      where: { user: { id: user.id } },
    });
  }

  public async findOne(user: User, id: number): Promise<any> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${id}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    });

    const data = await response.json();

    if ('results' in data && Array.isArray(data.results)) {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        results: data.results,
      };
    }

    return data;
  }

  public async create(user: User, dto: CreateDto): Promise<any> {
    const url = `${process.env.TMDB_BASE_URL}/4/list`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_USER_TOKEN}`,
      },
      body: JSON.stringify({
        name: dto.name,
        description: dto.description,
        iso_639_1: 'en',
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return data;
    }

    const selection = await this.selectionRepository.save({
      id: data.id,
      name: dto.name,
      description: dto.description,
    });

    const foundUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { selections: true },
    });

    foundUser!.selections = [...foundUser!.selections, selection];
    await this.userRepository.save(foundUser!);

    return data;
  }
}
