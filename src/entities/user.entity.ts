import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Role } from './role.entity';
import { Beneficiary } from './beneficiary.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'userid' })
  userId: number;

  @Column({ unique: true })
  username: string;

  @Column()
  credentials: string;

  @Column()
  salt: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'usersid',
      referencedColumnName: 'userId'
    },
    inverseJoinColumn: {
      name: 'rolesid',
      referencedColumnName: 'roleId'
    }
  })
  roles: Role[];

  @OneToOne(() => Beneficiary, beneficiary => beneficiary.user)
  beneficiary: Beneficiary;
} 