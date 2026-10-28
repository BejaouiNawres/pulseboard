import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppConfig,
  AppSettings,
  AuthConfig,
  DatabaseConfig,
  RedisConfig,
} from './configuration';
import { Environment } from './env.validation';

/**
 * Typed facade over @nestjs/config.
 * Inject this instead of ConfigService: no string keys, no casts, full autocompletion.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  get app(): AppSettings {
    return this.config.get('app', { infer: true });
  }

  get database(): DatabaseConfig {
    return this.config.get('database', { infer: true });
  }

  get redis(): RedisConfig {
    return this.config.get('redis', { infer: true });
  }

  get auth(): AuthConfig {
    return this.config.get('auth', { infer: true });
  }

  get isProduction(): boolean {
    return this.app.nodeEnv === Environment.Production;
  }

  get isDevelopment(): boolean {
    return this.app.nodeEnv === Environment.Development;
  }
}
