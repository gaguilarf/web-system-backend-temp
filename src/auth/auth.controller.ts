// auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

@ApiTags('auth') // Agrupa los endpoints bajo el tag "auth"
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Registrar nuevo usuario',
        description: 'Crea una nueva cuenta de usuario y devuelve un token JWT'
    })
    @ApiBody({
        type: RegisterDto,
        description: 'Datos del nuevo usuario',
        examples: {
            usuario_normal: {
                summary: 'Usuario normal',
                value: {
                    email: 'nuevo@ejemplo.com',
                    password: 'Password123!',
                    name: 'Nuevo Usuario'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: RegisterResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'El email debe ser válido',
                    'La contraseña debe tener al menos 6 caracteres',
                    'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
                ],
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: 'El email ya está registrado',
        schema: {
            example: {
                statusCode: 409,
                message: 'El email ya está registrado',
                error: 'Conflict'
            }
        }
    })
    async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario y devuelve un token JWT'
    })
    @ApiBody({
        type: LoginDto,
        description: 'Credenciales del usuario',
        examples: {
            usuario_normal: {
                summary: 'Usuario normal',
                value: {
                    email: 'usuario@ejemplo.com',
                    password: 'Password123'
                }
            },
            administrador: {
                summary: 'Administrador',
                value: {
                    email: 'admin@ejemplo.com',
                    password: 'Admin123'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos',
        schema: {
            example: {
                statusCode: 400,
                message: ['email debe ser un email válido', 'password no debe estar vacío'],
                error: 'Bad Request'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciales inválidas',
        schema: {
            example: {
                statusCode: 401,
                message: 'Credenciales inválidas',
                error: 'Unauthorized'
            }
        }
    })
    async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(loginDto);
    }
}