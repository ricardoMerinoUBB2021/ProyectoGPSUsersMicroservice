import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { Beneficiary } from './beneficiary.entity';

@Entity('persons')
export class Person {
  @Column({ primary: true })
  rut: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastname: string;

  @OneToOne(() => Beneficiary)
  @JoinColumn({ name: 'beneficiaryid' })
  beneficiary: Beneficiary;
} 