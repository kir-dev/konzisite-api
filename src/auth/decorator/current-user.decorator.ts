import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtUserDto } from 'src/auth/dto/jwtUser.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'

type AnyUser = UserEntity | JwtUserDto

export const CurrentUser = createParamDecorator<keyof AnyUser | undefined>(
  /**
   * Get req.user from the execution context
   *
   * @param key key to get from req.user
   * @returns `JwtUserDto` if using JWT guard or `UserDto` if using authsch guard or the requested property from the user
   */
  (key, context: ExecutionContext) => {
    const user: AnyUser = context.switchToHttp().getRequest().user

    if (!user) {
      throw new InternalServerErrorException(
        'CurrentUser decorator invoked without authGuard',
      )
    }

    if (key && !user.hasOwnProperty(key)) {
      throw new InternalServerErrorException(
        `Unknown key ${key} in CurrentUser decorator`,
      )
    }

    return key ? user[key] : user
  },
)

export const CurrentUserOptional = createParamDecorator<
  keyof AnyUser | undefined
>(
  /**
   * Get req.user from the execution context, but don't throw error if it doesn't exist
   *
   * @param key key to get from req.user
   * @returns `JwtUserDto` if using JWT guard or `UserDto` if using authsch guard or the requested property from the user, or false if there's no token with the request
   */
  (key, context: ExecutionContext) => {
    const user: AnyUser = context.switchToHttp().getRequest().user
    if (key && !user?.hasOwnProperty(key)) {
      throw new InternalServerErrorException(
        `Unknown key ${key} in CurrentUser decorator`,
      )
    }

    return key ? user[key] : user
  },
)
