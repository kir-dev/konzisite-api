import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { GroupsService } from './groups.service'

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: any) {
    return this.groupsService.create(createGroupDto)
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
  update(@Param('id') id: string, @Body() updateGroupDto: any) {
    return this.groupsService.update(+id, updateGroupDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(+id)
  }
}
