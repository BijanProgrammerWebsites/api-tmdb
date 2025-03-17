import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

import { SelectionController } from './selection.controller';
import { SelectionService } from './selection.service';
import { Selection } from './selection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Selection]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [SelectionController],
  providers: [SelectionService],
  exports: [TypeOrmModule],
})
export class SelectionModule {}
