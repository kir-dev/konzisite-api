import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthschStrategy } from './authsch.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    HttpModule,
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthschStrategy],
})
export class AuthModule {}
