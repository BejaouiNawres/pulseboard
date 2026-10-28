import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateMetricDto {
  @IsString()
  source: string;

  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class MetricQueryDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 100;
}
