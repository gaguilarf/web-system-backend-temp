import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Buscar usuario por email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'password', 'roles', 'createdAt', 'updatedAt'],
        });
    }

    /**
     * Buscar usuario por ID
     */
    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
        });
    }

    /**
     * Crear nuevo usuario con password hasheado
     */
    async create(email: string, password: string, name: string): Promise<User> {
        // Verificar si el email ya existe
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // Hashear password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            name,
            roles: ['user'], // Rol por defecto
        });

        return this.usersRepository.save(user);
    }

    /**
     * Validar password
     */
    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
