import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
    @ApiProperty({
        description: 'ID del usuario',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    user_id: number;

    @ApiProperty({
        description: 'ID del usuario en Clerk',
        example: 'user_2abc123def',
    })
    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    clerk_user_id: string;

    @ApiProperty({
        description: 'ID del rol asignado',
        example: 1,
    })
    @Column({ name: 'user_role', nullable: true })
    user_role: number;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan Pérez',
    })
    @Column({ type: 'varchar', length: 255 })
    user_name: string;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com',
    })
    @Column({ type: 'varchar', length: 255, unique: true })
    user_email: string;

    @Column({ type: 'varchar', length: 255, select: false, nullable: true }) // Nullable porque Clerk maneja passwords
    user_password_hash: string;

    @ApiProperty({
        description: 'DNI del usuario',
        example: '12345678',
        required: false,
    })
    @Column({ type: 'varchar', length: 20, nullable: true })
    user_dni: string;

    @ApiProperty({
        description: 'Fecha del último login',
        example: '2024-01-01T00:00:00.000Z',
        required: false,
    })
    @Column({ type: 'timestamp', nullable: true })
    user_last_login: Date;

    @ApiProperty({
        description: 'Fecha de creación del usuario',
        example: '2024-01-01T00:00:00.000Z',
    })
    @CreateDateColumn({ name: 'user_created_date' })
    user_created_date: Date;

    @ApiProperty({
        description: 'Fecha de última modificación del usuario',
        example: '2024-01-01T00:00:00.000Z',
    })
    @UpdateDateColumn({ name: 'user_modified_date' })
    user_modified_date: Date;

    @ApiProperty({
        description: 'Estado del usuario (activo/inactivo)',
        example: true,
    })
    @Column({ type: 'boolean', default: true })
    user_is_active: boolean;

    // Relación Many-to-One con Role
    @ManyToOne(() => Role, (role) => role.users, { eager: true })
    @JoinColumn({ name: 'user_role' })
    role: Role;
}
