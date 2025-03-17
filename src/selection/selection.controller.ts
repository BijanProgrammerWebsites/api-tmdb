import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { User } from '../user/user.entity';

import { CreateDto } from './dto/create.dto';

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
  public findOne(@GetUser() user: User, @Param('id') id: number) {
    return this.selectionService.findOne(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  public update(@GetUser() user: User, @Body() dto: CreateDto) {
    return this.selectionService.create(user, dto);
  }
}
