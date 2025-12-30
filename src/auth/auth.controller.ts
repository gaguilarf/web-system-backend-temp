import { Controller, Post, Get, Headers, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from '../clerk/clerk.guard';
import { CurrentUser } from '../clerk/clerk.decorator';
import type { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('webhook')
    @ApiOperation({ summary: 'Webhook de Clerk para sincronizar usuarios' })
    @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente' })
    @ApiResponse({ status: 400, description: 'Firma de webhook inválida' })
    async handleWebhook(
        @Req() req: Request,
        @Headers() headers: any,
    ) {
        // Obtener el raw body para verificar la firma
        const payload = req.body?.toString() || '';

        return this.authService.handleWebhook(payload, {
            'svix-id': headers['svix-id'],
            'svix-timestamp': headers['svix-timestamp'],
            'svix-signature': headers['svix-signature'],
        });
    }

    @Get('me')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener información del usuario actual' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    async getCurrentUser(@CurrentUser() user: any) {
        return this.authService.getCurrentUser(user.userId);
    }
}