import {
  BadRequestException,
  Body,
  Delete,
  Get,
  NotFoundException,
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
import { CreateManyResponse } from 'src/utils/CreateManyResponse.dto'
import { ApiController } from 'src/utils/apiController.decorator'
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
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @Get()
  findAll(
    @CurrentUser() user: UserEntity,
    @Query('search') nameFilter?: string,
    @Query('limit') limit?: number,
  ): Promise<GroupPreviewDto[]> {
    if (limit < 0) {
      throw new BadRequestException('Érvénytelen limit paraméter!')
    }
    return this.groupsService.findAll(user.id, nameFilter, limit)
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<GroupDetailsDto> {
    try {
      return await this.groupsService.findOne(id, user.id)
    } catch {
      throw new NotFoundException('A csoport nem található!')
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
    } catch {
      throw new BadRequestException('Már létezik csoport ilyen névvel!')
    }
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    try {
      return await this.groupsService.update(id, updateGroupDto)
    } catch {
      throw new BadRequestException('Már létezik csoport ilyen névvel!')
    }
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
          throw new BadRequestException('Már tagja vagy a csoportnak!')
        }
        if (e.code === 'P2003') {
          throw new NotFoundException('A csoport nem található!')
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
          throw new BadRequestException('Nem tudsz kilépni ebből a csoportból!')
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
          throw new BadRequestException('A felhasználó már tagja a csoportnak!')
        }
        if (e.code === 'P2003') {
          throw new NotFoundException('A felhasználó nem található!')
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
          throw new BadRequestException('A felhasználó már tagja a csoportnak!')
        }
        if (e.code === 'P2003') {
          throw new NotFoundException('A felhasználó nem található!')
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
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new BadRequestException('A felhasználó nem tagja a csoportnak!')
    }

    if (member.role === GroupRole.ADMIN || member.role === GroupRole.OWNER) {
      throw new BadRequestException(
        'Admint vagy tulajdonost nem lehet eltávolítani!',
      )
    }

    return await this.groupsService.removeMember(groupId, userId)
  }

  @Post(':id/approve/:userId')
  @RequiredPermission(Permissions.AddMember)
  async approveMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new BadRequestException('A felhasználó nem tagja a csoportnak!')
    }

    if (member.role !== GroupRole.PENDING && member.role !== GroupRole.NONE) {
      throw new BadRequestException('A felhasználó már el lett fogadva!')
    }

    return await this.groupsService.setMemberRole(
      groupId,
      userId,
      GroupRole.MEMBER,
    )
  }

  @Post(':id/decline/:userId')
  @RequiredPermission(Permissions.AddMember)
  async declineMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new BadRequestException('A felhasználó nem tagja a csoportnak!')
    }

    if (member.role !== GroupRole.PENDING && member.role !== GroupRole.NONE) {
      throw new BadRequestException('A felhasználó már el lett fogadva!')
    }

    return await this.groupsService.removeMember(groupId, userId)
  }

  @Post(':id/promote/:userId')
  @RequiredPermission(Permissions.PromoteMember)
  async promoteMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new BadRequestException('A felhasználó nem tagja a csoportnak!')
    }

    if (member.role === GroupRole.ADMIN || member.role === GroupRole.OWNER) {
      throw new BadRequestException('A felhasználó már admin!')
    }

    return await this.groupsService.setMemberRole(
      groupId,
      userId,
      GroupRole.ADMIN,
    )
  }

  @Post(':id/demote/:userId')
  @RequiredPermission(Permissions.PromoteMember)
  async demoteUser(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, userId)

    if (!member) {
      throw new BadRequestException('A felhasználó nem tagja a csoportnak!')
    }

    if (member.role !== GroupRole.ADMIN) {
      throw new BadRequestException('A felhasználó nem admin!')
    }

    return await this.groupsService.setMemberRole(
      groupId,
      userId,
      GroupRole.MEMBER,
    )
  }

  @Post('/:id/subscribe')
  async subscribe(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, user.id)

    if (!member) {
      throw new BadRequestException('Hiba a feliratkozásban!')
    }

    return await this.groupsService.setSubscribe(user.id, groupId, true)
  }

  @Post('/:id/unsubscribe')
  async unsubscribe(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    const member = await this.groupsService.findMember(groupId, user.id)

    if (!member) {
      throw new BadRequestException('Hiba a leiratkozásban!')
    }

    return await this.groupsService.setSubscribe(user.id, groupId, false)
  }
}
