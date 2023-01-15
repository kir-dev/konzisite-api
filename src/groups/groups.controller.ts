import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { GroupRole } from '@prisma/client'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { CurrentUser } from 'src/current-user.decorator'
import { ManyUniqueUsersDto } from 'src/users/dto/ManyUniqueUsers.dto'
import { UniqueUserDto } from 'src/users/dto/UniqueUser.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateGroupDto } from './dto/CreateGroup.dto'
import { CreateManyResponse } from './dto/CreateManyResponse.dto'
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

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: UserEntity,
  ): Promise<GroupEntity> {
    const newGroup = await this.groupsService.create({
      ...createGroupDto,
      ownerId: user.id,
    })
    await this.groupsService.addMember(newGroup.id, user.id, GroupRole.OWNER)
    return newGroup
  }

  @Post(':id/join')
  joinGroup(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    return this.groupsService.addMember(groupId, user.id, GroupRole.PENDING)
  }

  // Todo /:id/leave

  @Post(':id/add')
  @RequiredPermission(Permissions.AddMember)
  async addMember(
    @Body() userToAdd: UniqueUserDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    return this.groupsService.addMember(
      groupId,
      userToAdd.userId,
      GroupRole.MEMBER,
    )
  }

  @Post(':id/addMany')
  @RequiredPermission(Permissions.AddMember)
  addManyMembers(
    @Body() user: ManyUniqueUsersDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<CreateManyResponse> {
    return this.groupsService.addManyMembers(groupId, user.userIds)
  }

  @Post(':id/remove')
  @RequiredPermission(Permissions.AddMember)
  async removeMember(
    @Body() userToRemove: UniqueUserDto,
    @Param('id', ParseIntPipe) groupId: number,
  ): Promise<UserToGroupEntity> {
    return this.groupsService.removeMember(groupId, userToRemove.userId)
  }

  @Get()
  findAll(@CurrentUser() user: UserEntity): Promise<GroupPreviewDto[]> {
    return this.groupsService.findAll(user.id)
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<GroupDetailsDto> {
    return this.groupsService.findOne(id, user.id)
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    return this.groupsService.update(id, updateGroupDto)
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<GroupEntity> {
    return this.groupsService.remove(id)
  }

  // Todo /:id/approve/:userid
  // Todo /:id/decline/:userid
  // Todo /:id/promote/:userid
  // Todo /:id/demote/:userid
}
