import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UpdateDto } from './dto/update.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  public info(@GetUser() user: User) {
    return this.userService.info(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  public update(@GetUser() user: User, @Body() dto: UpdateDto) {
    return this.userService.update(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-password')
  public updatePassword(@GetUser() user: User, @Body() dto: UpdatePasswordDto) {
    return this.userService.updatePassword(user, dto);
  }
}
