import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { User } from '../user/user.entity';

import { CreateDto } from './dto/create.dto';
import { AddMovieDto } from './dto/add-movie.dto';
import { RemoveMovieDto } from './dto/remove-movie.dto';

import { SelectionService } from './selection.service';

@Controller('selection')
export class SelectionController {
  public constructor(private readonly selectionService: SelectionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public findAll(@GetUser() user: User) {
    return this.selectionService.findAll(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public findOne(@Param('id') id: number) {
    return this.selectionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public update(@GetUser() user: User, @Body() dto: CreateDto) {
    return this.selectionService.create(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/movie')
  public addMovie(@Param('id') selectionId: number, @Body() dto: AddMovieDto) {
    return this.selectionService.addMovie(selectionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/movie')
  public removeMovie(
    @Param('id') selectionId: number,
    @Body() dto: RemoveMovieDto,
  ) {
    return this.selectionService.removeMovie(selectionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/clear')
  public clear(@Param('id') selectionId: number) {
    return this.selectionService.clear(selectionId);
  }
}
