import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
    @ApiProperty({
        description: 'Token de acceso JWT',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    access_token: string;

    @ApiProperty({
        description: 'Tipo de token',
        example: 'Bearer',
    })
    token_type: string;

    @ApiProperty({
        description: 'Tiempo de expiración del token en segundos',
        example: 3600,
    })
    expires_in: number;

    @ApiProperty({
        description: 'ID del usuario registrado',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    user_id: string;
}
