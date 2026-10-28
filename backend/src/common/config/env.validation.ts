import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Schema of the raw environment variables.
 * Validated once at boot: the app refuses to start with a bad configuration
 * instead of failing later at runtime.
 */
export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string = 'http://localhost:5173';

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string = 'localhost';

  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT: number = 6379;

  // OIDC issuer, e.g. http://localhost:8080/realms/pulseboard (Keycloak)
  // or https://login.microsoftonline.com/<tenant>/v2.0 (Entra ID)
  @IsUrl({ require_tld: false, require_protocol: true })
  AUTH_ISSUER_URL: string;

  // Expected `aud` claim of access tokens
  @IsString()
  @IsNotEmpty()
  AUTH_AUDIENCE: string;

  // Optional: skips OIDC discovery when set
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  AUTH_JWKS_URI?: string;

  // Dot-path of the roles array inside the token
  // Keycloak: realm_access.roles — Entra ID: roles
  @IsString()
  @IsNotEmpty()
  AUTH_ROLES_CLAIM: string = 'realm_access.roles';
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  return validated;
}
