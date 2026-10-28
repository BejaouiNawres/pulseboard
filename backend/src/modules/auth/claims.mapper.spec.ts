import { UserRole } from '../users/user.entity';
import { mapClaimsToIdentity } from './claims.mapper';

describe('mapClaimsToIdentity', () => {
  it('maps a Keycloak user token', () => {
    const identity = mapClaimsToIdentity(
      {
        sub: 'kc-123',
        email: 'admin@pulseboard.dev',
        name: 'Ada Admin',
        preferred_username: 'admin@pulseboard.dev',
        realm_access: { roles: ['admin', 'viewer', 'offline_access', 'uma_authorization'] },
      },
      'realm_access.roles',
    );

    expect(identity).toEqual({
      externalId: 'kc-123',
      email: 'admin@pulseboard.dev',
      name: 'Ada Admin',
      roles: [UserRole.ADMIN, UserRole.VIEWER],
    });
  });

  it('maps an Entra ID token with a top-level roles claim', () => {
    const identity = mapClaimsToIdentity(
      { sub: 'aad-456', upn: 'jane@contoso.com', given_name: 'Jane', family_name: 'Doe', roles: ['viewer'] },
      'roles',
    );

    expect(identity).toEqual({
      externalId: 'aad-456',
      email: 'jane@contoso.com',
      name: 'Jane Doe',
      roles: [UserRole.VIEWER],
    });
  });

  it('maps a service account token without email', () => {
    const identity = mapClaimsToIdentity(
      {
        sub: 'sa-789',
        preferred_username: 'service-account-pulseboard-ingestor',
        realm_access: { roles: ['ingestor'] },
      },
      'realm_access.roles',
    );

    expect(identity.email).toBeNull();
    expect(identity.name).toBe('service-account-pulseboard-ingestor');
    expect(identity.roles).toEqual([UserRole.INGESTOR]);
  });

  it('returns no roles when the claim is missing or malformed', () => {
    expect(mapClaimsToIdentity({ sub: 'x' }, 'realm_access.roles').roles).toEqual([]);
    expect(mapClaimsToIdentity({ sub: 'x', roles: 'admin' }, 'roles').roles).toEqual([]);
  });

  it('throws when the token has no subject', () => {
    expect(() => mapClaimsToIdentity({}, 'roles')).toThrow('Token has no subject');
  });
});
