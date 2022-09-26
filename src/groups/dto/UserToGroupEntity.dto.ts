import { GroupRoles } from './GroupEntity.dto'

export class UserToGroupEntity {
  userId: number
  groupId: number
  role: GroupRoles
  joinedAt: Date
}
