import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'roleid' })
  roleId: number;

  @Column({ name: 'rolename', unique: true })
  roleName: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'rolesid',
      referencedColumnName: 'roleId'
    },
    inverseJoinColumn: {
      name: 'permissionsid',
      referencedColumnName: 'permissionsId'
    }
  })
  permissions: Permission[];
} 