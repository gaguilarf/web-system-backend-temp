import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol',
        example: 'editor',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    rol_name: string;

    @ApiProperty({
        description: 'Descripción del rol',
        example: 'Editor de contenido',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    rol_description?: string;

    @ApiProperty({
        description: 'Permisos del rol en formato JSON',
        example: { canRead: true, canCreate: true, canEdit: true, canDelete: false },
        required: false,
    })
    @IsObject()
    @IsOptional()
    rol_permissions?: object;
}
