import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ProxyModule } from './proxy/proxy.module';

import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

import { SelectionModule } from './selection/selection.module';
import { Selection } from './selection/selection.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST!,
      port: parseInt(process.env.DATABASE_PORT!),
      username: process.env.DATABASE_USERNAME!,
      password: process.env.DATABASE_PASSWORD!,
      database: process.env.DATABASE_DATABASE!,
      entities: [User, Selection],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    SelectionModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
