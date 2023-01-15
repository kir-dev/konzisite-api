import { Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { CurrentUser } from 'src/current-user.decorator'
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
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.findOne(id)
  }

  @Post(':id/promote')
  @RequiredPermission(Permissions.PromoteUser)
  promote(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.promoteUser(id)
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.remove(id)
  }
}
