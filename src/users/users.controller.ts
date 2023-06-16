import {
  BadRequestException,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { ApiController } from 'src/utils/apiController.decorator'
import { UserDetails } from './dto/UserDetails'
import { UserEntity } from './dto/UserEntity.dto'
import { UserList } from './dto/UserList.dto'
import { UserProfileDto } from './dto/UserProfile.dto'
import { ReportService } from './report.service'
import { UsersService } from './users.service'

@JwtAuth()
@AuthorizationSubject('User')
@ApiController('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly reportService: ReportService,
  ) {}

  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
  })
  @Get()
  findAll(
    @Query('search') nameFilter?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ): Promise<UserList> {
    if (page < 0 || pageSize < 0) {
      throw new BadRequestException('Érvénytelen lapozási paraméterek!')
    }
    return this.usersService.findAll(nameFilter, page, pageSize)
  }

  @Get('profile')
  findProfile(@CurrentUser() user: UserEntity): Promise<UserProfileDto> {
    return this.usersService.profile(user)
  }

  @Get('report')
  async getReport(
    @CurrentUser() user: UserEntity,
    @Query('startDate', ParseIntPipe) startDate: number,
    @Query('endDate', ParseIntPipe) endDate: number,
  ): Promise<StreamableFile> {
    if (startDate >= endDate) {
      throw new BadRequestException('Invalid date range!')
    }
    if (endDate > Date.now()) {
      throw new BadRequestException(
        'Invalid date range! You can only generate reports based on consultations in the past.',
      )
    }
    return new StreamableFile(
      await this.reportService.generateUserReport(
        user,
        new Date(startDate),
        new Date(endDate),
      ),
    )
  }

  @Get('admin-report')
  @RequiredPermission(Permissions.GenerateAdminReport)
  async getAdminReport(
    @Query('startDate', ParseIntPipe) startDate: number,
    @Query('endDate', ParseIntPipe) endDate: number,
  ): Promise<StreamableFile> {
    if (startDate >= endDate) {
      throw new BadRequestException('Invalid date range!')
    }
    if (endDate > Date.now()) {
      throw new BadRequestException(
        'Invalid date range! You can only generate reports based on consultations in the past.',
      )
    }
    return new StreamableFile(
      await this.reportService.generateAdminReport(
        new Date(startDate),
        new Date(endDate),
      ),
    )
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<UserDetails> {
    return await this.usersService.findOne(id, user)
  }

  @Post(':id/promote')
  @RequiredPermission(Permissions.PromoteUser)
  async promote(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    try {
      return await this.usersService.promoteUser(id)
    } catch {
      throw new NotFoundException('A felhasználó nem található!')
    }
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    try {
      return await this.usersService.remove(id)
    } catch {
      throw new NotFoundException('A felhasználó nem található!')
    }
  }
}
