import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @ApiProperty({
        description: 'ID del usuario',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com',
    })
    @Column({ unique: true })
    email: string;

    @Column({ select: false }) // No se incluye por defecto en las consultas
    password: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan Pérez',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'Roles del usuario',
        example: ['user', 'admin'],
        isArray: true,
    })
    @Column('simple-array', { default: 'user' })
    roles: string[];

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2024-01-01T00:00:00.000Z',
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2024-01-01T00:00:00.000Z',
    })
    @UpdateDateColumn()
    updatedAt: Date;
}