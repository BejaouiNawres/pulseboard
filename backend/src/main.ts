import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppConfigService } from './common/config/config.service';
import { SocketIoAdapter } from './modules/events/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS for frontend (HTTP + WebSocket)
  app.enableCors({
    origin: config.app.frontendUrl,
    credentials: true,
  });
  app.useWebSocketAdapter(new SocketIoAdapter(app, config));

  // Global prefix
  app.setGlobalPrefix('api');

  const { port } = config.app;
  await app.listen(port);
  console.log(`🚀 PulseBoard API running on http://localhost:${port}/api`);
}

bootstrap();
