import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { GroupEntity, GroupRoles } from './GroupEntity.dto'

export class GroupPreviewDto extends GroupEntity {
  memberCount: number
  owner: UserEntity
  currentUserRole: GroupRoles
}
