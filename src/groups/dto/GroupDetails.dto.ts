import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { GroupEntity, GroupRoles } from './GroupEntity.dto'

export class GroupDetailsDto extends GroupEntity {
  members: (PublicUser & {
    joinedAt: Date
    role: GroupRoles
  })[]
  owner: PublicUser
  currentUserRole: GroupRoles
}
