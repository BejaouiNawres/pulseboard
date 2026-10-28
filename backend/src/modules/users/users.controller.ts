import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users — every account that has logged in at least once
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
