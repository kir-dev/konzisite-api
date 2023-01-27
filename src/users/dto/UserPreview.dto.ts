import { PublicUser } from './PublicUser.dto'

export class UserPreview extends PublicUser {
  presentations: number
  avarageRating: number
  attendances: number
}
