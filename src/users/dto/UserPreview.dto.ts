import { UserEntity } from './UserEntity.dto'

export class UserPreview extends UserEntity {
  presentations: number
  avarageRating: number
  attendances: number
}
