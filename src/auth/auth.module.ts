import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersModule } from 'src/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AuthschStrategy } from './authsch.strategy'

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2d' },
    }),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthschStrategy, AuthService],
})
export class AuthModule {}
