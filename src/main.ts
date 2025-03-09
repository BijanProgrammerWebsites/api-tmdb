import { NestFactory } from '@nestjs/core';

import 'reflect-metadata';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('tmdb');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3008);
}

void bootstrap();
