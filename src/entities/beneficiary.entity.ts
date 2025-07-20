import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('beneficiary')
export class Beneficiary {
  @PrimaryGeneratedColumn({ name: 'beneficiaryid' })
  beneficiaryId: number;

  @Column({ name: 'discountcategory' })
  discountCategory: string;

  @Column({ type: 'real', nullable: true })
  discount: number;

  @OneToOne(() => User, user => user.beneficiary)
  @JoinColumn({ name: 'userid' })
  user: User;
} 