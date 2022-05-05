import {
  Controller,
  Get,
  Logger,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('authsch'))
  @Get('login')
  async login(@Req() req) {
    return req.user
  }

  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  @Redirect()
  async oauthRedirect(@Req() req) {
    const { jwt } = this.authService.login(req.user)
    return { url: `${process.env.FRONTEND_AUTHORIZED_URL}?jwt=${jwt}` }
  }
}
