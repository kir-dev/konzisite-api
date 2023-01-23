import {
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { ApiController } from 'src/utils/apiController.decorator'
import { UserEntity } from './dto/UserEntity.dto'
import { UsersService } from './users.service'

@JwtAuth()
@AuthorizationSubject('User')
@ApiController('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserEntity[] /*UserPreview[]*/> {
    return this.usersService.findAll()
  }

  @Get('profile')
  findProfile(
    @CurrentUser() user: UserEntity,
  ): Promise<UserEntity /*UserDetails*/> {
    return this.usersService.findOne(user.id)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const res = await this.usersService.findOne(id)
    if (res === null) {
      throw new HttpException(
        'A felhasználó nem található!',
        HttpStatus.NOT_FOUND,
      )
    }
    return res
  }

  @Post(':id/promote')
  @RequiredPermission(Permissions.PromoteUser)
  async promote(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    try {
      return await this.usersService.promoteUser(id)
    } catch {
      throw new HttpException(
        'A felhasználó nem található!',
        HttpStatus.NOT_FOUND,
      )
    }
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    try {
      return await this.usersService.remove(id)
    } catch {
      throw new HttpException(
        'A felhasználó nem található!',
        HttpStatus.NOT_FOUND,
      )
    }
  }
}
