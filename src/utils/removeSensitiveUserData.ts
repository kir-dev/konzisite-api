import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'

export const removeSensitiveUserData = ({
  id,
  fullName,
}: UserEntity): PublicUser => ({ id, fullName })
