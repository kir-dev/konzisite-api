import { Controller, Get, Logger, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  @Get('login')
  @UseGuards(AuthGuard('authsch'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async login() {}

  @Get('callback')
  @UseGuards(AuthGuard('authsch'))
  async oauthRedirect(@Request() req) {
    return req.user
  }
}
