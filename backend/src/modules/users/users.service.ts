import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { OidcIdentity } from '../auth/auth.types';

// When a token carries several roles, the most privileged one is stored locally
const ROLE_PRECEDENCE: UserRole[] = [UserRole.ADMIN, UserRole.VIEWER, UserRole.INGESTOR];

const UNIQUE_VIOLATION = '23505';

export function primaryRole(roles: UserRole[]): UserRole {
  return ROLE_PRECEDENCE.find((role) => roles.includes(role)) ?? UserRole.VIEWER;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /** Creates the user on first login, then keeps profile and role in sync with the IdP. */
  async upsertFromIdentity(identity: OidcIdentity): Promise<User> {
    const profile = {
      email: identity.email,
      name: identity.name,
      role: primaryRole(identity.roles),
    };

    const existing = await this.findByExternalId(identity.externalId);
    if (!existing) {
      try {
        return await this.usersRepository.save(
          this.usersRepository.create({ externalId: identity.externalId, ...profile }),
        );
      } catch (err) {
        // Two concurrent first requests: the other one created the row
        const code = (err as QueryFailedError & { driverError?: { code?: string } }).driverError?.code;
        if (err instanceof QueryFailedError && code === UNIQUE_VIOLATION) {
          return (await this.findByExternalId(identity.externalId))!;
        }
        throw err;
      }
    }

    const changed =
      existing.email !== profile.email ||
      existing.name !== profile.name ||
      existing.role !== profile.role;
    return changed ? this.usersRepository.save(Object.assign(existing, profile)) : existing;
  }

  async findByExternalId(externalId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { externalId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'ASC' } });
  }
}
