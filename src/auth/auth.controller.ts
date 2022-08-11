import { Controller, Get, Logger, Redirect, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import { CurrentUser } from 'src/current-user.decorator'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('authsch'))
  @Get('login')
  async login(@CurrentUser() user: User) {
    return user
  }

  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  @Redirect()
  async oauthRedirect(@CurrentUser() user: User) {
    const { jwt } = this.authService.login(user)
    return { url: `${process.env.FRONTEND_AUTHORIZED_URL}?jwt=${jwt}` }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return user
  }
}
