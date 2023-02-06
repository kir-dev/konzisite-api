import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { GroupEntity, GroupRoles } from './GroupEntity.dto'

export class GroupPreviewDto extends GroupEntity {
  memberCount: number
  owner: PublicUser
  currentUserRole: GroupRoles
}
