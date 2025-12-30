import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private rolesService: RolesService,
    ) { }

    /**
     * Buscar usuario por email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_email: email },
            select: ['user_id', 'user_email', 'user_name', 'user_password_hash', 'user_role', 'user_dni', 'user_last_login', 'user_created_date', 'user_modified_date', 'user_is_active'],
            relations: ['role'],
        });
    }

    /**
     * Buscar usuario por ID
     */
    async findById(id: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { user_id: id },
            relations: ['role'],
        });
    }

    /**
     * Crear nuevo usuario con password hasheado
     */
    async create(email: string, password: string, name: string, dni?: string): Promise<User> {
        // Verificar si el email ya existe
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Hashear password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Obtener rol por defecto (user)
        const defaultRole = await this.rolesService.findByName('user');
        if (!defaultRole) {
            throw new NotFoundException('Rol por defecto no encontrado');
        }

        // Crear usuario
        const user = this.usersRepository.create({
            user_email: email,
            user_password_hash: hashedPassword,
            user_name: name,
            user_dni: dni,
            user_role: defaultRole.rol_id,
        });

        return this.usersRepository.save(user);
    }

    /**
     * Validar password
     */
    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Actualizar último login
     */
    async updateLastLogin(userId: number): Promise<void> {
        await this.usersRepository.update(userId, {
            user_last_login: new Date(),
        });
    }
}
