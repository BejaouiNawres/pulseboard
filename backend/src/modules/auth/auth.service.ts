import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AppConfigService } from '../../common/config/config.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser, OidcIdentity } from './auth.types';
import { mapClaimsToIdentity } from './claims.mapper';
import { OidcTokenVerifier } from './oidc-token.verifier';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly verifier: OidcTokenVerifier,
    private readonly usersService: UsersService,
    private readonly config: AppConfigService,
  ) {}

  /**
   * Verifies the token, maps its claims and provisions the user locally
   * on first login (JIT provisioning). Shared by the HTTP guard and the WebSocket gateway.
   */
  async authenticate(token: string): Promise<AuthenticatedUser> {
    let identity: OidcIdentity;
    try {
      const payload = await this.verifier.verify(token);
      identity = mapClaimsToIdentity(payload, this.config.auth.rolesClaim);
    } catch (err) {
      this.logger.debug(`Token rejected: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (identity.roles.length === 0) {
      throw new ForbiddenException('No PulseBoard role assigned to this account');
    }

    const user = await this.usersService.upsertFromIdentity(identity);
    return { id: user.id, ...identity };
  }
}
