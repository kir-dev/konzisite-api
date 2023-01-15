import { applyDecorators, UseGuards } from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthorizationGuard } from '../authorization.guard'

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}

export function JwtAuth() {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    UseGuards(AuthorizationGuard),
  )
}
