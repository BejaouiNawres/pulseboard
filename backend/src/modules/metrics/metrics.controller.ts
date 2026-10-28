import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto, MetricQueryDto } from './dto/create-metric.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('metrics')
@Roles(UserRole.ADMIN, UserRole.VIEWER)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  // POST /api/metrics — push a new metric (data sources use client_credentials)
  @Post()
  @Roles(UserRole.ADMIN, UserRole.INGESTOR)
  create(@Body() createMetricDto: CreateMetricDto) {
    return this.metricsService.create(createMetricDto);
  }

  // GET /api/metrics — get metrics with optional filters
  @Get()
  findAll(@Query() query: MetricQueryDto) {
    return this.metricsService.findAll(query);
  }

  // GET /api/metrics/sources — list all unique sources
  @Get('sources')
  getSources() {
    return this.metricsService.getSources();
  }

  // GET /api/metrics/source/:name — latest metrics for a source
  @Get('source/:name')
  getBySource(@Param('name') name: string) {
    return this.metricsService.getLatestBySource(name);
  }
}
