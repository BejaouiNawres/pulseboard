import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { primaryRole, UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((data: Partial<User>) => data),
    save: jest.fn(async (user: Partial<User>) => ({ id: 'local-uuid', ...user })),
  };

  const identity = {
    externalId: 'kc-1',
    email: 'admin@pulseboard.dev',
    name: 'Ada Admin',
    roles: [UserRole.VIEWER, UserRole.ADMIN],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repo }],
    }).compile();
    service = module.get(UsersService);
  });

  it('creates the user on first login with the most privileged role', async () => {
    repo.findOne.mockResolvedValue(null);

    const user = await service.upsertFromIdentity(identity);

    expect(repo.save).toHaveBeenCalledWith({
      externalId: 'kc-1',
      email: 'admin@pulseboard.dev',
      name: 'Ada Admin',
      role: UserRole.ADMIN,
    });
    expect(user.id).toBe('local-uuid');
  });

  it('does not write when nothing changed', async () => {
    const existing = { id: 'local-uuid', externalId: 'kc-1', email: identity.email, name: identity.name, role: UserRole.ADMIN };
    repo.findOne.mockResolvedValue(existing);

    await expect(service.upsertFromIdentity(identity)).resolves.toBe(existing);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('syncs the role when it changed in the identity provider', async () => {
    repo.findOne.mockResolvedValue({ id: 'local-uuid', externalId: 'kc-1', email: identity.email, name: identity.name, role: UserRole.VIEWER });

    const user = await service.upsertFromIdentity(identity);

    expect(repo.save).toHaveBeenCalled();
    expect(user.role).toBe(UserRole.ADMIN);
  });

  it.each([
    [[UserRole.INGESTOR, UserRole.VIEWER], UserRole.VIEWER],
    [[UserRole.INGESTOR], UserRole.INGESTOR],
    [[UserRole.VIEWER, UserRole.ADMIN], UserRole.ADMIN],
  ])('primaryRole(%j) is %s', (roles, expected) => {
    expect(primaryRole(roles)).toBe(expected);
  });
});
