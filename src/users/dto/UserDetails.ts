import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'
import { ConsultationRequestEntity } from 'src/consultations/dto/ConsultationRequestEntity.dto'
import { RatingEntity } from 'src/consultations/dto/RatingEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from './PublicUser.dto'

export class UserDetails extends PublicUser {
  isAdmin: boolean
  presentations: (ConsultationEntity & {
    subject: SubjectEntity
    ratings: (RatingEntity & { rater: PublicUser })[]
    participants: number
  })[]
  participations: (ConsultationEntity & {
    subject: SubjectEntity
  })[]
  consultationRequests?: (ConsultationRequestEntity & {
    subject: SubjectEntity
    supporters: number
  })[]
  stats: UserStats
}

export class UserStats {
  presentationCount: number
  allParticipants: number
  ratingCount: number
  averageRating: number
  participationCount: number
}
