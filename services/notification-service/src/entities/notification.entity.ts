import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  type!: string;

  @Column()
  content!: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sentAt!: Date;

  @BeforeInsert()
  setTimestamps() {
    this.sentAt = new Date();
  }
} 