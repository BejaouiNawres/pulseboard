import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MetricsService } from './metrics.service';
import { Metric } from './metric.entity';

describe('MetricsService', () => {
  let service: MetricsService;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: getRepositoryToken(Metric), useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should save metric and emit event', async () => {
      const dto = { source: 'srv-01', name: 'cpu_usage', value: 78.5, unit: '%' };
      const saved = { id: 'uuid', ...dto, createdAt: new Date() };

      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(mockRepo.save).toHaveBeenCalledWith(dto);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('metric.created', saved);
      expect(result).toEqual(saved);
    });
  });
});
