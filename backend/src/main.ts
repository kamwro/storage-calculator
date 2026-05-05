import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpErrorFilter } from './shared/http/error.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

// Fail-fast: JWT_SECRET must be present and strong enough before the app boots.
// Generate a suitable value with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
function assertJwtSecret(): void {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    console.error(
      'FATAL: JWT_SECRET is missing or too short (minimum 32 characters). ' +
        'Set it via the JWT_SECRET environment variable.',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  assertJwtSecret();

  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

  // Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
  app.use(helmet());

  // Global API prefix to match frontend and README base URL
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpErrorFilter());

  // Swagger is only available outside production to avoid exposing the API schema.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Storage Calculator API')
      .setDescription('API for managing containers, items and evaluating packing strategies')
      .setVersion('1.0.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste JWT token from /auth/login or /auth/register',
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
}
bootstrap();
