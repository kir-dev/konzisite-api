import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
  AppSubjects,
  CaslAbilityFactory,
  Permissions,
} from './casl-ability.factory'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<Permissions>(
      'permission',
      context.getHandler(),
    )
    const requestSubject = this.reflector.get<AppSubjects>(
      'subject',
      context.getClass(),
    )
    if (!action || !requestSubject) return true
    const request = context.switchToHttp().getRequest()

    switch (requestSubject) {
      case 'Group': {
        const groupId: number = +request.params.id
        if (Number.isNaN(groupId) && request.params.id) {
          throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
        }

        const ability = await this.caslAbilityFactory.createForGroup(
          request.user,
          groupId,
        )
        return ability.can(action, requestSubject)
      }
      case 'Subject': {
        const ability = await this.caslAbilityFactory.createForSubject(
          request.user,
        )
        return ability.can(action, requestSubject)
      }
      default:
        return true
    }
  }
}
