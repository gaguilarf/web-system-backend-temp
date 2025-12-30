import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { UsersService } from '../users/users.service';
import { CLERK_CLIENT } from '../clerk/clerk.module';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
        @Inject(CLERK_CLIENT) private clerkClient: any,
    ) { }

    /**
     * Verificar y procesar webhook de Clerk
     */
    async handleWebhook(payload: string, headers: any): Promise<any> {
        const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

        if (!webhookSecret) {
            throw new BadRequestException('Webhook secret not configured');
        }

        // Verificar firma del webhook
        const wh = new Webhook(webhookSecret);
        let evt: any;

        try {
            evt = wh.verify(payload, headers);
        } catch (err) {
            throw new BadRequestException('Invalid webhook signature');
        }

        // Procesar evento según tipo
        const eventType = evt.type;
        const clerkUser = evt.data;

        switch (eventType) {
            case 'user.created':
                return await this.handleUserCreated(clerkUser);
            case 'user.updated':
                return await this.handleUserUpdated(clerkUser);
            case 'user.deleted':
                return await this.handleUserDeleted(clerkUser.id);
            default:
                console.log(`Unhandled webhook event type: ${eventType}`);
                return { received: true };
        }
    }

    /**
     * Manejar creación de usuario desde Clerk
     */
    private async handleUserCreated(clerkUser: any) {
        try {
            const user = await this.usersService.createFromClerk(clerkUser);
            return { success: true, user };
        } catch (error) {
            console.error('Error creating user from Clerk:', error);
            throw error;
        }
    }

    /**
     * Manejar actualización de usuario desde Clerk
     */
    private async handleUserUpdated(clerkUser: any) {
        try {
            const user = await this.usersService.updateFromClerk(clerkUser);
            return { success: true, user };
        } catch (error) {
            console.error('Error updating user from Clerk:', error);
            throw error;
        }
    }

    /**
     * Manejar eliminación de usuario desde Clerk
     */
    private async handleUserDeleted(clerkUserId: string) {
        try {
            await this.usersService.deactivate(clerkUserId);
            return { success: true };
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }

    /**
     * Obtener información del usuario actual desde Clerk
     */
    async getCurrentUser(userId: string) {
        try {
            // Buscar en nuestra DB
            const user = await this.usersService.findByClerkId(userId);

            if (!user) {
                // Si no existe, sincronizar desde Clerk
                const clerkUser = await this.clerkClient.users.getUser(userId);
                return await this.usersService.createFromClerk(clerkUser);
            }

            // Actualizar último login
            await this.usersService.updateLastLogin(user.user_id);

            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    }
}
