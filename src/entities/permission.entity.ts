import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ name: 'permissionsid' })
  permissionsId: number;

  @Column({ name: 'permissionname' })
  permissionName: string;

  @Column({ nullable: true })
  description: string;
} 