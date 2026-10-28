import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './common/config/config.module';
import { AppConfigService } from './common/config/config.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { EventsModule } from './modules/events/events.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    // Config — validated, typed, global
    AppConfigModule,

    // Database
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        type: 'postgres',
        host: config.database.host,
        port: config.database.port,
        username: config.database.user,
        password: config.database.password,
        database: config.database.name,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: !config.isProduction,
        logging: config.isDevelopment,
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    MetricsModule,
    AlertsModule,
    EventsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
