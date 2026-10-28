import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user.entity';
import { AuthService } from '../auth.service';
import { AuthenticatedUser } from '../auth.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

const viewer: AuthenticatedUser = {
  id: 'u1',
  externalId: 'kc-1',
  email: 'viewer@pulseboard.dev',
  name: 'Victor Viewer',
  roles: [UserRole.VIEWER],
};

function httpContext(request: Record<string, unknown>, metadata: Record<string, unknown> = {}) {
  const handler = () => undefined;
  Object.entries(metadata).forEach(([key, value]) => Reflect.defineMetadata(key, value, handler));
  return {
    getType: () => 'http',
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const authService = { authenticate: jest.fn() };
  const guard = new JwtAuthGuard(new Reflector(), authService as unknown as AuthService);

  beforeEach(() => jest.resetAllMocks());

  it('lets @Public() routes through without a token', async () => {
    await expect(guard.canActivate(httpContext({ headers: {} }, { [IS_PUBLIC_KEY]: true }))).resolves.toBe(true);
    expect(authService.authenticate).not.toHaveBeenCalled();
  });

  it('rejects requests without a bearer token', async () => {
    await expect(guard.canActivate(httpContext({ headers: {} }))).rejects.toThrow(UnauthorizedException);
  });

  it('authenticates the token and attaches the user to the request', async () => {
    authService.authenticate.mockResolvedValue(viewer);
    const request: Record<string, unknown> = { headers: { authorization: 'Bearer abc.def.ghi' } };

    await expect(guard.canActivate(httpContext(request))).resolves.toBe(true);
    expect(authService.authenticate).toHaveBeenCalledWith('abc.def.ghi');
    expect(request.user).toBe(viewer);
  });
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows any authenticated user when no role is required', () => {
    expect(guard.canActivate(httpContext({ user: viewer }))).toBe(true);
  });

  it('allows a user with one of the required roles', () => {
    const ctx = httpContext({ user: viewer }, { [ROLES_KEY]: [UserRole.ADMIN, UserRole.VIEWER] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('forbids a user without the required role', () => {
    const ctx = httpContext({ user: viewer }, { [ROLES_KEY]: [UserRole.ADMIN] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
