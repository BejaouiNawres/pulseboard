import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { AppConfigService } from '../../common/config/config.service';

/**
 * Socket.IO adapter that reads CORS settings from AppConfigService.
 * @WebSocketGateway() options are evaluated at decoration time, before DI exists,
 * so config-dependent options must be applied here instead.
 */
export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private readonly config: AppConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.config.app.frontendUrl, credentials: true },
    });
  }
}
