import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'
import { ConsultationRequestEntity } from 'src/consultations/dto/ConsultationRequestEntity.dto'
import { RatingEntity } from 'src/consultations/dto/RatingEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from './PublicUser.dto'

export class UserDetails extends PublicUser {
  presentations: (ConsultationEntity & {
    subject: SubjectEntity
    ratings: (RatingEntity & { rater: PublicUser })[]
  })[]
  participations: (ConsultationEntity & {
    subject: SubjectEntity
  })[]
  consultationRequests: (ConsultationRequestEntity & {
    subject: SubjectEntity
  })[]
  avarageRating: number
}
