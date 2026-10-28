import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Metric } from '../metrics/metric.entity';

export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  INGESTOR = 'ingestor',
}

/**
 * Local mirror of an identity managed by the OIDC provider.
 * Created on first login (JIT provisioning); credentials never touch this API.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // `sub` claim of the identity provider
  @Column({ unique: true })
  externalId: string;

  // Null for service accounts (machine clients)
  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @OneToMany(() => Metric, (metric) => metric.user)
  metrics: Metric[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
