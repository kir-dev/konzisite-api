import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { GroupRole, Prisma } from '@prisma/client'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { ManyUniqueUsersDto } from 'src/users/dto/ManyUniqueUsers.dto'
import { UniqueUserDto } from 'src/users/dto/UniqueUser.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateManyResponse } from 'src/utils/CreateManyResponse.dto'
import { CreateGroupDto } from './dto/CreateGroup.dto'
import { GroupDetailsDto } from './dto/GroupDetails.dto'
import { GroupEntity } from './dto/GroupEntity.dto'
import { GroupPreviewDto } from './dto/GroupPreview.dto'
import { UpdateGroupDto } from './dto/UpdateGroup.dto'
import { UserToGroupEntity } from './dto/UserToGroupEntity.dto'
import { GroupsService } from './groups.service'

@JwtAuth()
@ApiController('groups')
@AuthorizationSubject('Group')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiQuery({
    name: 'search',
    required: false,
  })
  @Get()
  async findAll(
    @CurrentUser() user: UserEntity,
    @Query('search') nameFilter: string,
  ): Promise<GroupPreviewDto[]> {
    return this.groupsService.findAll(user.id, nameFilter)
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<GroupDetailsDto> {
    try {
      return await this.groupsService.findOne(id, user.id)
    } catch {
      throw new HttpException('A csoport nem található!', HttpStatus.NOT_FOUND)
    }
  }

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: UserEntity,
  ): Promise<GroupEntity> {
    const newGroup = await this.groupsService.create(createGroupDto, user)
    await this.groupsService.addMember(newGroup.id, user.id, GroupRole.OWNER)
    return newGroup
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    return await this.groupsService.update(id, updateGroupDto)
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<GroupEntity> {
    return await this.groupsService.remove(id)
  }

  @Post(':id/join')
  async joinGroup(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.addMember(
        groupId,
        user.id,
        GroupRole.PENDING,
      )
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'Már tagja vagy a csoportnak!',
            HttpStatus.BAD_REQUEST,
          )
        }
        if (e.code === 'P2003') {
          throw new HttpException(
            'A csoport nem található!',
            HttpStatus.NOT_FOUND,
          )
        }
      }
      throw e
    }
  }

  // Todo /:id/leave

  @Post(':id/add')
  @RequiredPermission(Permissions.AddMember)
  async addMember(
    @Body() userToAdd: UniqueUserDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.addMember(
        groupId,
        userToAdd.userId,
        GroupRole.MEMBER,
      )
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'A felhasználó már tagja a csoportnak!',
            HttpStatus.BAD_REQUEST,
          )
        }
        if (e.code === 'P2003') {
          throw new HttpException(
            'A felhasználó nem található!',
            HttpStatus.NOT_FOUND,
          )
        }
      }
      throw e
    }
  }

  @Post(':id/addMany')
  @RequiredPermission(Permissions.AddMember)
  async addManyMembers(
    @Body() user: ManyUniqueUsersDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<CreateManyResponse> {
    try {
      return await this.groupsService.addManyMembers(groupId, user.userIds)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            'A felhasználó már tagja a csoportnak!',
            HttpStatus.BAD_REQUEST,
          )
        }
        if (e.code === 'P2003') {
          throw new HttpException(
            'A felhasználó nem található!',
            HttpStatus.NOT_FOUND,
          )
        }
      }
      throw e
    }
  }

  @Post(':id/remove')
  @RequiredPermission(Permissions.AddMember)
  async removeMember(
    @Body() userToRemove: UniqueUserDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.removeMember(groupId, userToRemove.userId)
    } catch {
      throw new HttpException(
        'Érvénytelen felhasználó azonosító!',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // Todo /:id/approve/:userid
  // Todo /:id/decline/:userid
  // Todo /:id/promote/:userid
  // Todo /:id/demote/:userid
}
