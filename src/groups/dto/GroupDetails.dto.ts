import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { GroupEntity, GroupRoles } from './GroupEntity.dto'

export class GroupDetailsDto extends GroupEntity {
  members: (UserEntity & {
    joinedAt: Date
    role: GroupRoles
  })[]
  owner: UserEntity
  currentUserRole: GroupRoles
}
