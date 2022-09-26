import { Delete, Get, Param, ParseIntPipe } from '@nestjs/common'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { CurrentUser } from 'src/current-user.decorator'
import { ApiController } from 'src/utils/apiController.decorator'
import { UserEntity } from './dto/UserEntity.dto'
import { UsersService } from './users.service'

@JwtAuth()
@ApiController('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserEntity[] /*UserPreview[]*/> {
    return this.usersService.findAll()
  }

  @Get('profile')
  @JwtAuth()
  findProfile(
    @CurrentUser() user: UserEntity,
  ): Promise<UserEntity /*UserDetails*/> {
    return this.usersService.findOne(user.id)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    return this.usersService.findOne(id)
  }

  @Delete('profile')
  remove(@CurrentUser() user: UserEntity): Promise<UserEntity> {
    return this.usersService.remove(user.id)
  }
}
