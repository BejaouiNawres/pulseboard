import { Controller, Get, Put, Param, ParseUUIDPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('alerts')
@Roles(UserRole.ADMIN, UserRole.VIEWER)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.alertsService.findActive();
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.resolve(id);
  }
}
