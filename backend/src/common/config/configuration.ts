import { Environment } from './env.validation';

export interface AppSettings {
  nodeEnv: Environment;
  port: number;
  frontendUrl: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface AuthConfig {
  issuerUrl: string;
  audience: string;
  jwksUri?: string;
  rolesClaim: string;
}

export interface AppConfig {
  app: AppSettings;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
}

/**
 * Factory: maps flat process.env variables to a typed, nested config object.
 * This is the only place in the codebase that reads process.env.
 * Runs after validateEnv(), so required values are guaranteed to be present.
 */
export default (): AppConfig => ({
  app: {
    nodeEnv: (process.env.NODE_ENV as Environment) ?? Environment.Development,
    port: parseInt(process.env.PORT ?? '3000', 10),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
  database: {
    host: process.env.DATABASE_HOST!,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    name: process.env.DATABASE_NAME!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD ?? '',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  auth: {
    issuerUrl: process.env.AUTH_ISSUER_URL!,
    audience: process.env.AUTH_AUDIENCE!,
    jwksUri: process.env.AUTH_JWKS_URI || undefined,
    rolesClaim: process.env.AUTH_ROLES_CLAIM ?? 'realm_access.roles',
  },
});
