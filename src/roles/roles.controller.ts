import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { ClerkAuthGuard } from '../clerk/clerk.guard';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @UseGuards(ClerkAuthGuard)
    @ApiOperation({ summary: 'Crear nuevo rol' })
    @ApiResponse({ status: 201, description: 'Rol creado exitosamente', type: Role })
    @ApiResponse({ status: 409, description: 'El rol ya existe' })
    @ApiBearerAuth('JWT-auth')
    create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los roles activos' })
    @ApiResponse({ status: 200, description: 'Lista de roles', type: [Role] })
    findAll(): Promise<Role[]> {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener rol por ID' })
    @ApiResponse({ status: 200, description: 'Rol encontrado', type: Role })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Role> {
        return this.rolesService.findById(id);
    }

    @Patch(':id')
    @UseGuards(ClerkAuthGuard)
    @ApiOperation({ summary: 'Actualizar rol' })
    @ApiResponse({ status: 200, description: 'Rol actualizado', type: Role })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    @ApiBearerAuth('JWT-auth')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto
    ): Promise<Role> {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @UseGuards(ClerkAuthGuard)
    @ApiOperation({ summary: 'Desactivar rol' })
    @ApiResponse({ status: 200, description: 'Rol desactivado', type: Role })
    @ApiResponse({ status: 404, description: 'Rol no encontrado' })
    @ApiBearerAuth('JWT-auth')
    deactivate(@Param('id', ParseIntPipe) id: number): Promise<Role> {
        return this.rolesService.deactivate(id);
    }
}

