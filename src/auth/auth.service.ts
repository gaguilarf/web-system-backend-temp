// auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
    ) { }

    /**
     * Registrar nuevo usuario
     */
    async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
        try {
            // Crear usuario (el servicio ya verifica duplicados y hashea el password)
            const user = await this.usersService.create(
                registerDto.email,
                registerDto.password,
                registerDto.name,
                registerDto.dni,
            );

            return {
                access_token: 'temp_token', // TODO: Implementar con AuthJS
                token_type: 'Bearer',
                expires_in: 3600,
                user_id: user.user_id.toString(),
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new Error('Error al registrar usuario');
        }
    }

    /**
     * Login de usuario
     */
    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        // Validar usuario y contraseña
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Actualizar último login
        await this.usersService.updateLastLogin(user.user_id);

        return {
            access_token: 'temp_token', // TODO: Implementar con AuthJS
            token_type: 'Bearer',
            expires_in: 3600,
            user_id: user.user_id.toString(),
        };
    }

    /**
     * Validar credenciales de usuario
     */
    private async validateUser(email: string, password: string): Promise<any | null> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return null;
        }

        // Validar password
        const isPasswordValid = await this.usersService.validatePassword(password, user.user_password_hash);

        if (!isPasswordValid) {
            return null;
        }

        // Retornar usuario sin el password
        const { user_password_hash: _, ...result } = user;
        return result;
    }
}
