import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('metrics')
@Index(['source', 'createdAt'])
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source: string; // e.g. 'machine-01', 'server-prod'

  @Column()
  name: string; // e.g. 'cpu_usage', 'temperature'

  @Column('float')
  value: number;

  @Column({ nullable: true })
  unit: string; // e.g. '%', '°C', 'ms'

  @ManyToOne(() => User, (user) => user.metrics, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
