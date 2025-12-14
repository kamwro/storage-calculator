import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpErrorFilter } from './shared/http/error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global API prefix to match frontend and README base URL
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());
  await app.listen(3000);
}
bootstrap();
