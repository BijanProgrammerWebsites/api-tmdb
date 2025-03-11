import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as cookieParser from 'cookie-parser';

import 'reflect-metadata';

import { AppModule } from './app.module';

import { ValidationExceptionFilter } from './validation.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('tmdb');

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(process.env.PORT ?? 3008);
}

void bootstrap();
