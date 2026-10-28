import configuration from './configuration';

describe('configuration factory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      NODE_ENV: 'test',
      PORT: '4000',
      FRONTEND_URL: 'https://pulseboard.app',
      DATABASE_HOST: 'db',
      DATABASE_PORT: '5433',
      DATABASE_NAME: 'pulseboard',
      DATABASE_USER: 'admin',
      DATABASE_PASSWORD: 'pwd',
      REDIS_HOST: 'cache',
      REDIS_PORT: '6380',
      AUTH_ISSUER_URL: 'https://login.microsoftonline.com/tenant/v2.0',
      AUTH_AUDIENCE: 'api://pulseboard',
      AUTH_JWKS_URI: 'https://login.microsoftonline.com/tenant/discovery/v2.0/keys',
      AUTH_ROLES_CLAIM: 'roles',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('maps environment variables to a typed nested object', () => {
    expect(configuration()).toEqual({
      app: { nodeEnv: 'test', port: 4000, frontendUrl: 'https://pulseboard.app' },
      database: { host: 'db', port: 5433, name: 'pulseboard', user: 'admin', password: 'pwd' },
      redis: { host: 'cache', port: 6380 },
      auth: {
        issuerUrl: 'https://login.microsoftonline.com/tenant/v2.0',
        audience: 'api://pulseboard',
        jwksUri: 'https://login.microsoftonline.com/tenant/discovery/v2.0/keys',
        rolesClaim: 'roles',
      },
    });
  });

  it('falls back to defaults for optional values', () => {
    delete process.env.PORT;
    delete process.env.REDIS_PORT;
    delete process.env.AUTH_JWKS_URI;
    delete process.env.AUTH_ROLES_CLAIM;

    const config = configuration();

    expect(config.app.port).toBe(3000);
    expect(config.redis.port).toBe(6379);
    expect(config.auth.jwksUri).toBeUndefined();
    expect(config.auth.rolesClaim).toBe('realm_access.roles');
  });
});
