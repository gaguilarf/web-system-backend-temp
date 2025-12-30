import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { CLERK_CLIENT } from './clerk.module';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    constructor(
        @Inject(CLERK_CLIENT) private clerkClient: any,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify the session token
            const sessionClaims = await this.clerkClient.verifyToken(token);

            // Attach user info to request
            request.user = {
                userId: sessionClaims.sub,
                sessionId: sessionClaims.sid,
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
