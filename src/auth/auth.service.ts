// auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
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
            );

            // Generar token JWT
            const token = this.generateToken(user);

            return {
                access_token: token,
                token_type: 'Bearer',
                expires_in: 3600,
                user_id: user.id,
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

        // Generar token
        const token = this.generateToken(user);

        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: 3600,
            user_id: user.id,
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
        const isPasswordValid = await this.usersService.validatePassword(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        // Retornar usuario sin el password
        const { password: _, ...result } = user;
        return result;
    }

    /**
     * Generar token JWT
     */
    private generateToken(user: any): string {
        // Payload del token JWT
        const payload = {
            sub: user.id, // Subject (ID del usuario)
            email: user.email,
            roles: user.roles || [], // Roles del usuario (opcional)
        };

        // Generar y retornar el token JWT
        return this.jwtService.sign(payload);
    }
}