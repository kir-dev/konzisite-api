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
    try {
      const newGroup = await this.groupsService.create(createGroupDto, user)
      await this.groupsService.addMember(newGroup.id, user.id, GroupRole.OWNER)
      return newGroup
    } catch (e) {
      throw new HttpException(
        'Már létezik csoport ilyen névvel!',
        HttpStatus.BAD_REQUEST,
      )
    }
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

  @Post(':id/leave')
  async leaveGroup(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.removeMember(groupId, user.id)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new HttpException(
            'Nem tudsz kilépni ebből a csoportból!',
            HttpStatus.BAD_REQUEST,
          )
        }
      }
      throw e
    }
  }

  @Post(':id/add/:userId')
  @RequiredPermission(Permissions.AddMember)
  async addMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.addMember(
        groupId,
        userId,
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

  @Post(':id/remove/:userId')
  @RequiredPermission(Permissions.AddMember)
  async removeMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserToGroupEntity> {
    try {
      return await this.groupsService.removeMember(groupId, userId)
    } catch {
      throw new HttpException(
        'Érvénytelen felhasználó azonosító!',
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post(':id/approve/:userId')
  @RequiredPermission(Permissions.AddMember)
  async approveMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new HttpException(
        'A felhasználó nem tagja a csoportnak!',
        HttpStatus.BAD_REQUEST,
      )
    }

    if (member.role !== GroupRole.PENDING && member.role !== GroupRole.NONE) {
      throw new HttpException(
        'A felhasználó már el lett fogadva!',
        HttpStatus.BAD_REQUEST,
      )
    }

    return await this.groupsService.setMemberRole(
      groupId,
      userId,
      GroupRole.MEMBER,
    )
  }

  // Todo /:id/approve/:userid
  // Todo /:id/decline/:userid
  // Todo /:id/promote/:userid
  // Todo /:id/demote/:userid
}
