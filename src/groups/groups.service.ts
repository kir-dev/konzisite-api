import { Injectable } from '@nestjs/common'

@Injectable()
export class GroupsService {
  create(createGroupDto: any) {
    return 'This action adds a new group'
  }

  findAll() {
    return `This action returns all groups`
  }

  findOne(id: number) {
    return `This action returns a #${id} group`
  }

  update(id: number, updateGroupDto: any) {
    return `This action updates a #${id} group`
  }

  remove(id: number) {
    return `This action removes a #${id} group`
  }
}
