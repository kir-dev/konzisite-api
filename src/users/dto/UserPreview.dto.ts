import { PublicUser } from './PublicUser.dto'

export class UserPreview extends PublicUser {
  presentations: number
  averageRating: number
  attendances: number
}
