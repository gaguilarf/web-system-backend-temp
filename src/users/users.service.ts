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
     * Buscar usuario por Clerk ID
     */
    async findByClerkId(clerkId: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { clerk_user_id: clerkId },
            relations: ['role'],
        });
    }

    /**
     * Crear usuario desde datos de Clerk
     */
    async createFromClerk(clerkUser: any): Promise<User> {
        // Verificar si el usuario ya existe
        const existingUser = await this.findByClerkId(clerkUser.id);
        if (existingUser) {
            throw new ConflictException('El usuario ya existe');
        }

        // Obtener rol por defecto (user)
        const defaultRole = await this.rolesService.findByName('user');
        if (!defaultRole) {
            throw new NotFoundException('Rol por defecto no encontrado');
        }

        // Extraer email primario
        const primaryEmail = clerkUser.email_addresses?.find((e: any) => e.id === clerkUser.primary_email_address_id);
        const email = primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address;

        // Crear usuario
        const user = this.usersRepository.create({
            clerk_user_id: clerkUser.id,
            user_email: email,
            user_name: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || email,
            user_role: defaultRole.rol_id,
            user_is_active: true,
        });

        return this.usersRepository.save(user);
    }

    /**
     * Actualizar usuario desde datos de Clerk
     */
    async updateFromClerk(clerkUser: any): Promise<User> {
        const user = await this.findByClerkId(clerkUser.id);
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Extraer email primario
        const primaryEmail = clerkUser.email_addresses?.find((e: any) => e.id === clerkUser.primary_email_address_id);
        const email = primaryEmail?.email_address || clerkUser.email_addresses?.[0]?.email_address;

        // Actualizar datos
        user.user_email = email;
        user.user_name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || email;

        return this.usersRepository.save(user);
    }

    /**
     * Validar password (mantenido para compatibilidad, pero no se usa con Clerk)
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

    /**
     * Desactivar usuario
     */
    async deactivate(clerkUserId: string): Promise<void> {
        const user = await this.findByClerkId(clerkUserId);
        if (user) {
            await this.usersRepository.update(user.user_id, {
                user_is_active: false,
            });
        }
    }
}

