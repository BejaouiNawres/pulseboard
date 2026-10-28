import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  // GET /api/auth/me — the authenticated principal, as seen by the API
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
