import 'reflect-metadata';
import { Environment, validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validEnv = {
    NODE_ENV: 'production',
    PORT: '8080',
    DATABASE_HOST: 'db',
    DATABASE_PORT: '5432',
    DATABASE_NAME: 'pulseboard',
    DATABASE_USER: 'postgres',
    DATABASE_PASSWORD: 'secret',
    AUTH_ISSUER_URL: 'http://localhost:8080/realms/pulseboard',
    AUTH_AUDIENCE: 'pulseboard-api',
  };

  it('converts string values and applies defaults', () => {
    const result = validateEnv(validEnv);

    expect(result.NODE_ENV).toBe(Environment.Production);
    expect(result.PORT).toBe(8080);
    expect(result.REDIS_PORT).toBe(6379);
    expect(result.AUTH_ROLES_CLAIM).toBe('realm_access.roles');
  });

  it('throws when a required variable is missing', () => {
    const { DATABASE_HOST, ...env } = validEnv;
    expect(() => validateEnv(env)).toThrow(/DATABASE_HOST/);
  });

  it('throws when the issuer is not a URL', () => {
    expect(() => validateEnv({ ...validEnv, AUTH_ISSUER_URL: 'pulseboard' })).toThrow(
      /AUTH_ISSUER_URL/,
    );
  });

  it('throws on an invalid NODE_ENV', () => {
    expect(() => validateEnv({ ...validEnv, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });
});
