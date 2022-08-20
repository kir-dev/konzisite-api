import {
  Body,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { CurrentUser } from 'src/current-user.decorator'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateUserDto } from './dto/CreateUser.dto'
import { UpdateUserDto } from './dto/UpdateUser.dto'
import { UserDto } from './dto/User.dto'
import { UsersService } from './users.service'

@ApiController('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private readonly logger = new Logger(UsersController.name)

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll(): Promise<UserDto[]> {
    return this.usersService.findAll()
  }

  @Get('profile')
  @JwtAuth()
  findProfile(@CurrentUser() user: UserDto): Promise<UserDto> {
    return this.usersService.findOne(user.id)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.remove(id)
  }
}
