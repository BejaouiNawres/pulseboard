import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Metric } from './metric.entity';
import { CreateMetricDto, MetricQueryDto } from './dto/create-metric.dto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricsRepository: Repository<Metric>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createMetricDto: CreateMetricDto): Promise<Metric> {
    const metric = this.metricsRepository.create(createMetricDto);
    const saved = await this.metricsRepository.save(metric);

    // Emit event for Socket.IO gateway and alert check
    this.eventEmitter.emit('metric.created', saved);

    return saved;
  }

  async findAll(query: MetricQueryDto): Promise<Metric[]> {
    const qb = this.metricsRepository
      .createQueryBuilder('metric')
      .orderBy('metric.createdAt', 'DESC')
      .take(query.limit || 100);

    if (query.source) {
      qb.andWhere('metric.source = :source', { source: query.source });
    }
    if (query.name) {
      qb.andWhere('metric.name = :name', { name: query.name });
    }

    return qb.getMany();
  }

  async getSources(): Promise<string[]> {
    const result = await this.metricsRepository
      .createQueryBuilder('metric')
      .select('DISTINCT metric.source', 'source')
      .getRawMany();
    return result.map((r) => r.source);
  }

  async getLatestBySource(source: string): Promise<Metric[]> {
    return this.metricsRepository
      .createQueryBuilder('metric')
      .where('metric.source = :source', { source })
      .orderBy('metric.createdAt', 'DESC')
      .take(50)
      .getMany();
  }
}
