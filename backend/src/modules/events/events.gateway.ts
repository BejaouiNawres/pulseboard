import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { Metric } from '../metrics/metric.entity';
import { Alert } from '../alerts/alert.entity';
import { AuthService } from '../auth/auth.service';
import { extractBearerToken } from '../auth/token.util';
import { UserRole } from '../users/user.entity';

const DASHBOARD_ROLES = [UserRole.ADMIN, UserRole.VIEWER];

// CORS is configured in SocketIoAdapter from AppConfigService
@WebSocketGateway()
export class EventsGateway implements OnGatewayInit {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: AuthService) {}

  // Handshake middleware: unauthenticated sockets never join the server,
  // so they cannot receive broadcasts. The client gets a `connect_error`.
  afterInit(server: Server): void {
    server.use((socket, next) => {
      this.authenticate(socket).then(
        () => next(),
        (err: Error) => {
          this.logger.warn(`WebSocket connection rejected: ${err.message}`);
          next(new Error('Unauthorized'));
        },
      );
    });
  }

  private async authenticate(socket: Socket): Promise<void> {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      extractBearerToken(socket.handshake.headers.authorization);
    if (!token) throw new Error('Missing token');

    const user = await this.authService.authenticate(token);
    if (!user.roles.some((role) => DASHBOARD_ROLES.includes(role))) {
      throw new Error(`Role not allowed: ${user.roles.join(', ')}`);
    }
    socket.data.user = user;
  }

  // Listen for new metrics from the MetricsService and broadcast to clients
  @OnEvent('metric.created')
  handleMetricCreated(metric: Metric): void {
    // Broadcast to all clients subscribed to this source
    this.server.to(`source:${metric.source}`).emit('metric:new', metric);
    // Also broadcast to the general feed
    this.server.emit('metric:feed', metric);
  }

  // Listen for triggered alerts and broadcast
  @OnEvent('alert.triggered')
  handleAlertTriggered(alert: Alert): void {
    this.server.emit('alert:triggered', alert);
  }

  // Client subscribes to a specific data source
  @SubscribeMessage('subscribe:source')
  handleSubscribeSource(
    @MessageBody() source: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`source:${source}`);
    client.emit('subscribed', { source });
  }

  // Client unsubscribes from a source
  @SubscribeMessage('unsubscribe:source')
  handleUnsubscribeSource(
    @MessageBody() source: string,
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(`source:${source}`);
  }
}
