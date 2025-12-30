import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'usuario@ejemplo.com',
        required: true,
    })
    @IsEmail({}, { message: 'El email debe ser válido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'Password123!',
        required: true,
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
    })
    password: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez',
        required: true,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    name: string;

    @ApiProperty({
        description: 'DNI del usuario',
        example: '12345678',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    dni?: string;
}

