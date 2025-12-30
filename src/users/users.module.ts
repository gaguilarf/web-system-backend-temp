import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { UsersService } from './users.service';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        RolesModule,
    ],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
