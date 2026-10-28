import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Alert, AlertSeverity, AlertStatus } from './alert.entity';
import { Metric } from '../metrics/metric.entity';

// Alert rules configuration
const ALERT_RULES: {
  metricName: string;
  threshold: number;
  severity: AlertSeverity;
}[] = [
  { metricName: 'cpu_usage', threshold: 90, severity: AlertSeverity.CRITICAL },
  { metricName: 'cpu_usage', threshold: 75, severity: AlertSeverity.HIGH },
  { metricName: 'temperature', threshold: 85, severity: AlertSeverity.CRITICAL },
  { metricName: 'temperature', threshold: 70, severity: AlertSeverity.MEDIUM },
  { metricName: 'memory_usage', threshold: 90, severity: AlertSeverity.HIGH },
  { metricName: 'response_time', threshold: 2000, severity: AlertSeverity.MEDIUM },
];

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Listen for new metrics and check alert rules
  @OnEvent('metric.created')
  async checkAlertRules(metric: Metric): Promise<void> {
    const matchingRules = ALERT_RULES.filter(
      (rule) =>
        rule.metricName === metric.name && metric.value >= rule.threshold,
    );

    for (const rule of matchingRules) {
      const alert = this.alertsRepository.create({
        source: metric.source,
        metricName: metric.name,
        threshold: rule.threshold,
        triggeredValue: metric.value,
        severity: rule.severity,
        message: `${metric.name} on ${metric.source} reached ${metric.value}${metric.unit || ''} (threshold: ${rule.threshold})`,
      });

      const saved = await this.alertsRepository.save(alert);
      // Emit for Socket.IO broadcast
      this.eventEmitter.emit('alert.triggered', saved);
    }
  }

  async findAll(): Promise<Alert[]> {
    return this.alertsRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findActive(): Promise<Alert[]> {
    return this.alertsRepository.find({
      where: { status: AlertStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async resolve(id: string): Promise<Alert> {
    const alert = await this.alertsRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }
    alert.status = AlertStatus.RESOLVED;
    return this.alertsRepository.save(alert);
  }
}
