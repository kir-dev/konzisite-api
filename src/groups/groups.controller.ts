import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CurrentUser } from 'src/current-user.decorator'
import { ManyUniqueUsersDto } from 'src/users/dto/ManyUniqueUsers.dto'
import { UniqueUserDto } from 'src/users/dto/UniqueUser.dto'
import { CreateGroupDto } from './dto/createGroup.dto'
import { UpdateGroupDto } from './dto/updateGroup.dto'
import { GroupsService } from './groups.service'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @CurrentUser() user: User,
  ) {
    const newGroup = await this.groupsService.create({
      ...createGroupDto,
      ownerId: user.id,
    })
    await this.groupsService.addMember(newGroup.id, user.id)
    return this.groupsService.findOne(newGroup.id)
  }

  @Post(':id/add')
  @UseGuards(JwtAuthGuard)
  addMember(@Body() user: UniqueUserDto, @Param('id') groupId: string) {
    return this.groupsService.addMember(+groupId, user.userId)
  }

  @Post(':id/addMany')
  @UseGuards(JwtAuthGuard)
  addManyMembers(
    @Body() user: ManyUniqueUsersDto,
    @Param('id') groupId: string,
  ) {
    return this.groupsService.addManyMembers(+groupId, user.userIds)
  }

  @Post(':id/remove')
  @UseGuards(JwtAuthGuard)
  removeMember(@Body() user: UniqueUserDto, @Param('id') groupId: string) {
    return this.groupsService.removeMember(+groupId, user.userId)
  }

  @Get()
  findAll() {
    return this.groupsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(+id, updateGroupDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id)
  }
}
