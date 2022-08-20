import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { GroupRole } from '@prisma/client'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { CurrentUser } from 'src/current-user.decorator'
import { ManyUniqueUsersDto } from 'src/users/dto/ManyUniqueUsers.dto'
import { UniqueUserDto } from 'src/users/dto/UniqueUser.dto'
import { UserDto } from 'src/users/dto/User.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateGroupDto } from './dto/createGroup.dto'
import { GroupDetailsDto } from './dto/GroupDetails.dto'
import { GroupPreviewDto } from './dto/GroupPreview.dto'
import { GroupSummaryDto } from './dto/GroupSummary.dto'
import { UpdateGroupDto } from './dto/updateGroup.dto'
import { GroupsService } from './groups.service'

@JwtAuth()
@ApiController('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: UserDto,
  ) {
    const newGroup = await this.groupsService.create({
      ...createGroupDto,
      ownerId: user.id,
    })
    await this.groupsService.addMember(newGroup.id, user.id, GroupRole.OWNER)
    return this.groupsService.findOne(newGroup.id, user.id)
  }

  @Post(':id/add')
  addMember(@Body() user: UniqueUserDto, @Param('id') groupId: string) {
    return this.groupsService.addMember(+groupId, user.userId, GroupRole.MEMBER)
  }

  @Post(':id/join')
  joinGroup(@CurrentUser() user: UniqueUserDto, @Param('id') groupId: string) {
    return this.groupsService.addMember(
      +groupId,
      user.userId,
      GroupRole.PENDING,
    )
  }

  @Post(':id/addMany')
  addManyMembers(
    @Body() user: ManyUniqueUsersDto,
    @Param('id') groupId: string,
  ) {
    return this.groupsService.addManyMembers(+groupId, user.userIds)
  }

  @Post(':id/remove')
  removeMember(@Body() user: UniqueUserDto, @Param('id') groupId: string) {
    return this.groupsService.removeMember(+groupId, user.userId)
  }

  @Get()
  @ApiProperty({ type: [GroupSummaryDto] })
  findAll(@CurrentUser() user: UserDto): Promise<GroupPreviewDto[]> {
    return this.groupsService.findAll(user.id)
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserDto,
  ): Promise<GroupDetailsDto> {
    return this.groupsService.findOne(id, user.id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupsService.remove(id)
  }
}
