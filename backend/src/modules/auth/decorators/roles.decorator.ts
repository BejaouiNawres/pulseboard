import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

export const ROLES_KEY = 'roles';

/** Grants access if the user has at least one of the given roles. Method-level overrides class-level. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
