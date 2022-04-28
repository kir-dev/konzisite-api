import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  @Get('login')
  @UseGuards(AuthGuard('authsch'))
  async login() {}

  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  async oauthRedirect(@Request() req) {
    return req.user
  }
}
