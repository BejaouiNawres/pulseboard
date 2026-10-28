import { Injectable, Logger } from '@nestjs/common';
import { createRemoteJWKSet, JWTPayload, jwtVerify, JWTVerifyGetKey } from 'jose';
import { AppConfigService } from '../../common/config/config.service';

/**
 * Verifies access tokens issued by any OIDC provider (Keycloak, Entra ID, Auth0...).
 * Public keys are fetched from the provider's JWKS endpoint, cached,
 * and refreshed automatically when the provider rotates its keys.
 */
@Injectable()
export class OidcTokenVerifier {
  private readonly logger = new Logger(OidcTokenVerifier.name);
  private keySet?: Promise<JWTVerifyGetKey>;

  constructor(private readonly config: AppConfigService) {}

  async verify(token: string): Promise<JWTPayload> {
    const { issuerUrl, audience } = this.config.auth;
    const { payload } = await jwtVerify(token, await this.getKeySet(), {
      issuer: issuerUrl,
      audience,
      algorithms: ['RS256'],
      clockTolerance: 5,
    });
    return payload;
  }

  // Lazy: the API can boot before the identity provider is reachable.
  protected getKeySet(): Promise<JWTVerifyGetKey> {
    this.keySet ??= this.loadKeySet().catch((err) => {
      this.keySet = undefined;
      throw err;
    });
    return this.keySet;
  }

  private async loadKeySet(): Promise<JWTVerifyGetKey> {
    const jwksUri = this.config.auth.jwksUri ?? (await this.discoverJwksUri());
    this.logger.log(`Using JWKS endpoint ${jwksUri}`);
    return createRemoteJWKSet(new URL(jwksUri), {
      cacheMaxAge: 10 * 60_000,
      cooldownDuration: 30_000,
    });
  }

  private async discoverJwksUri(): Promise<string> {
    const url = `${this.config.auth.issuerUrl.replace(/\/$/, '')}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OIDC discovery failed (${res.status}) at ${url}`);
    }
    const { jwks_uri } = (await res.json()) as { jwks_uri?: string };
    if (!jwks_uri) {
      throw new Error(`OIDC discovery document at ${url} has no jwks_uri`);
    }
    return jwks_uri;
  }
}
