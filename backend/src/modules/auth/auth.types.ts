import { UserRole } from '../users/user.entity';

/** Identity extracted from a verified OIDC access token. */
export interface OidcIdentity {
  externalId: string;
  email: string | null;
  name: string;
  roles: UserRole[];
}

/** Principal attached to `request.user` and `socket.data.user`. */
export interface AuthenticatedUser extends OidcIdentity {
  id: string;
}
