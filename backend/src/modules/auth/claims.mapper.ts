import { JWTPayload } from 'jose';
import { UserRole } from '../users/user.entity';
import { OidcIdentity } from './auth.types';

const KNOWN_ROLES = new Set<string>(Object.values(UserRole));

/** Reads a nested claim by dot-path, e.g. `realm_access.roles`. */
function readClaim(payload: JWTPayload, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[key] : undefined,
      payload,
    );
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Maps provider-specific claims to a PulseBoard identity.
 * Works with Keycloak (`realm_access.roles`, `preferred_username`)
 * and Entra ID (`roles`, `upn`) by changing only `rolesClaim`.
 */
export function mapClaimsToIdentity(payload: JWTPayload, rolesClaim: string): OidcIdentity {
  const externalId = asString(payload.sub);
  if (!externalId) {
    throw new Error('Token has no subject');
  }

  const username = asString(payload.preferred_username) ?? asString(payload.upn);
  const email = asString(payload.email) ?? (username?.includes('@') ? username : null);

  const fullName = [asString(payload.given_name), asString(payload.family_name)]
    .filter(Boolean)
    .join(' ');
  const name = asString(payload.name) ?? (fullName || username || externalId);

  const rawRoles = readClaim(payload, rolesClaim);
  const roles = Array.isArray(rawRoles)
    ? rawRoles.filter((r): r is UserRole => typeof r === 'string' && KNOWN_ROLES.has(r))
    : [];

  return { externalId, email, name, roles: [...new Set(roles)] };
}
