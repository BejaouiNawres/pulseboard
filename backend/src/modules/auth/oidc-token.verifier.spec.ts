import { createLocalJWKSet, exportJWK, generateKeyPair, JWTPayload, KeyLike, SignJWT } from 'jose';
import { AppConfigService } from '../../common/config/config.service';
import { OidcTokenVerifier } from './oidc-token.verifier';

const ISSUER = 'http://localhost:8080/realms/pulseboard';
const AUDIENCE = 'pulseboard-api';

describe('OidcTokenVerifier', () => {
  let signingKey: KeyLike;
  let otherKey: KeyLike;
  let verifier: OidcTokenVerifier;

  const sign = (
    claims: JWTPayload,
    { key = signingKey, issuer = ISSUER, audience = AUDIENCE, expiresIn = '5m' } = {},
  ) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(key);

  beforeAll(async () => {
    const pair = await generateKeyPair('RS256');
    signingKey = pair.privateKey;
    otherKey = (await generateKeyPair('RS256')).privateKey;
    const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'test-key', alg: 'RS256' };

    const config = { auth: { issuerUrl: ISSUER, audience: AUDIENCE } } as AppConfigService;
    verifier = new OidcTokenVerifier(config);
    // Replace the remote JWKS with a local one: real crypto, no network
    jest
      .spyOn(verifier as unknown as { getKeySet: () => Promise<unknown> }, 'getKeySet')
      .mockResolvedValue(createLocalJWKSet({ keys: [jwk] }));
  });

  it('accepts a valid token and returns its claims', async () => {
    const token = await sign({ sub: 'user-1' });
    await expect(verifier.verify(token)).resolves.toMatchObject({ sub: 'user-1', iss: ISSUER });
  });

  it('rejects a token signed by another key', async () => {
    const token = await sign({ sub: 'user-1' }, { key: otherKey });
    await expect(verifier.verify(token)).rejects.toThrow();
  });

  it('rejects a token from another issuer', async () => {
    const token = await sign({ sub: 'user-1' }, { issuer: 'https://evil.example.com' });
    await expect(verifier.verify(token)).rejects.toThrow(/iss/);
  });

  it('rejects a token for another audience', async () => {
    const token = await sign({ sub: 'user-1' }, { audience: 'account' });
    await expect(verifier.verify(token)).rejects.toThrow(/aud/);
  });

  it('rejects an expired token', async () => {
    const token = await sign({ sub: 'user-1' }, { expiresIn: '-1m' });
    await expect(verifier.verify(token)).rejects.toThrow(/exp/);
  });
});
