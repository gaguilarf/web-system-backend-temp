import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';

export const CLERK_CLIENT = 'CLERK_CLIENT';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: CLERK_CLIENT,
            useFactory: (configService: ConfigService) => {
                const secretKey = configService.get<string>('CLERK_SECRET_KEY');
                if (!secretKey) {
                    throw new Error('CLERK_SECRET_KEY is not defined in environment variables');
                }
                return createClerkClient({ secretKey });
            },
            inject: [ConfigService],
        },
    ],
    exports: [CLERK_CLIENT],
})
export class ClerkModule { }
