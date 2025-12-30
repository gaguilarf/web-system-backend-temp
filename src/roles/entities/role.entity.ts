import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('roles')
export class Role {
    @ApiProperty({
        description: 'ID del rol',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    rol_id: number;

    @ApiProperty({
        description: 'Nombre del rol',
        example: 'admin',
    })
    @Column({ type: 'varchar', length: 255, unique: true })
    rol_name: string;

    @ApiProperty({
        description: 'Descripción del rol',
        example: 'Administrador del sistema',
    })
    @Column({ type: 'varchar', length: 500, nullable: true })
    rol_description: string;

    @ApiProperty({
        description: 'Permisos del rol en formato JSON',
        example: { canCreate: true, canEdit: true, canDelete: true },
    })
    @Column({ type: 'jsonb', nullable: true })
    rol_permissions: object;

    @ApiProperty({
        description: 'Fecha de creación del rol',
        example: '2024-01-01T00:00:00.000Z',
    })
    @CreateDateColumn({ name: 'rol_created_date' })
    rol_created_date: Date;

    @ApiProperty({
        description: 'Fecha de última modificación del rol',
        example: '2024-01-01T00:00:00.000Z',
    })
    @UpdateDateColumn({ name: 'rol_modified_date' })
    rol_modified_date: Date;

    @ApiProperty({
        description: 'Estado del rol (activo/inactivo)',
        example: true,
    })
    @Column({ type: 'boolean', default: true })
    rol_is_active: boolean;

    // Relación One-to-Many con User
    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
