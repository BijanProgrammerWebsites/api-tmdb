import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ResponseDto } from '../shared/dto/response.dto';

import { User } from '../user/user.entity';

import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { AddMovieDto } from './dto/add-movie.dto';
import { RemoveMovieDto } from './dto/remove-movie.dto';

import { Selection } from './selection.entity';

@Injectable()
export class SelectionService {
  public constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Selection)
    private selectionRepository: Repository<Selection>,
  ) {}

  public async findAll(user: User): Promise<ResponseDto<any>> {
    const selections = await this.selectionRepository.find({
      where: { user: { id: user.id } },
    });

    return {
      statusCode: 200,
      message: 'Selections found successfully.',
      result: selections,
    };
  }

  public async findOne(id: number): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${id}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    if ('results' in data && Array.isArray(data.results)) {
      return {
        statusCode: 200,
        message: 'Selection found successfully.',
        result: {
          id: data.id,
          name: data.name,
          description: data.description,
          results: data.results,
        },
      };
    }

    return {
      statusCode: 400,
      message: 'Unknown error occurred.',
      error: 'Bad Request',
    };
  }

  public async create(user: User, dto: CreateDto): Promise<ResponseDto<any>> {
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
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
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

    return {
      statusCode: 200,
      message: 'Selection created successfully.',
      result: data,
    };
  }

  public async update(
    selectionId: number,
    dto: UpdateDto,
  ): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${selectionId}`;

    const response = await fetch(url, {
      method: 'PUT',
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
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    await this.selectionRepository.update(
      { id: selectionId },
      {
        name: dto.name,
        description: dto.description,
      },
    );

    return {
      statusCode: 200,
      message: 'Selection updated successfully.',
      result: data,
    };
  }

  public async remove(selectionId: number): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${selectionId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_USER_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    await this.selectionRepository.delete({ id: selectionId });

    return {
      statusCode: 200,
      message: 'Selection removed successfully.',
      result: data,
    };
  }

  public async clear(selectionId: number): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${selectionId}/clear`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_USER_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    return {
      statusCode: 200,
      message: 'Selection cleared successfully.',
      result: data,
    };
  }

  public async addMovie(
    selectionId: number,
    dto: AddMovieDto,
  ): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${selectionId}/items`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_USER_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{ media_id: dto.movieId, media_type: 'movie' }],
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    return {
      statusCode: 200,
      message: 'Movie added successfully.',
      result: data,
    };
  }

  public async removeMovie(
    selectionId: number,
    dto: RemoveMovieDto,
  ): Promise<ResponseDto<any>> {
    const url = `${process.env.TMDB_BASE_URL}/4/list/${selectionId}/items`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TMDB_USER_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{ media_id: dto.movieId, media_type: 'movie' }],
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        statusCode: data.status_code,
        message: data.errors[0],
        error: data.status_message,
      };
    }

    return {
      statusCode: 200,
      message: 'Movie removed successfully.',
      result: data,
    };
  }
}
