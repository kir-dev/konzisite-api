import { GroupRole } from '@prisma/client'
import { Expose } from 'class-transformer'
import { UserDto } from '../../users/dto/User.dto'

@Expose()
export class AllGroups {
  memberCount: number
  currentUserRole: GroupRole
  id: number
  name: string
  ownerId: number
  createdAt: Date
  owner: UserDto

  constructor(partial: Partial<AllGroups>) {
    Object.assign(this, partial)
    this.owner = new UserDto(this.owner)
  }
}
