import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
    ) { }

    /**
     * Obtener todos los roles activos
     */
    async findAll(): Promise<Role[]> {
        return this.rolesRepository.find({
            where: { rol_is_active: true },
            order: { rol_id: 'ASC' },
        });
    }

    /**
     * Buscar rol por ID
     */
    async findById(id: number): Promise<Role> {
        const role = await this.rolesRepository.findOne({
            where: { rol_id: id },
        });

        if (!role) {
            throw new NotFoundException(`Rol con ID ${id} no encontrado`);
        }

        return role;
    }

    /**
     * Buscar rol por nombre
     */
    async findByName(name: string): Promise<Role | null> {
        return this.rolesRepository.findOne({
            where: { rol_name: name },
        });
    }

    /**
     * Crear nuevo rol
     */
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        // Verificar si el rol ya existe
        const existingRole = await this.findByName(createRoleDto.rol_name);
        if (existingRole) {
            throw new ConflictException(`El rol '${createRoleDto.rol_name}' ya existe`);
        }

        const role = this.rolesRepository.create(createRoleDto);
        return this.rolesRepository.save(role);
    }

    /**
     * Actualizar rol existente
     */
    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findById(id);

        // Si se está actualizando el nombre, verificar que no exista otro rol con ese nombre
        if (updateRoleDto.rol_name && updateRoleDto.rol_name !== role.rol_name) {
            const existingRole = await this.findByName(updateRoleDto.rol_name);
            if (existingRole) {
                throw new ConflictException(`El rol '${updateRoleDto.rol_name}' ya existe`);
            }
        }

        Object.assign(role, updateRoleDto);
        return this.rolesRepository.save(role);
    }

    /**
     * Desactivar rol (soft delete)
     */
    async deactivate(id: number): Promise<Role> {
        const role = await this.findById(id);
        role.rol_is_active = false;
        return this.rolesRepository.save(role);
    }

    /**
     * Eliminar rol permanentemente
     */
    async remove(id: number): Promise<void> {
        const role = await this.findById(id);
        await this.rolesRepository.remove(role);
    }
}
