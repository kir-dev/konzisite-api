import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'
import { ConsultationRequestEntity } from 'src/consultations/dto/ConsultationRequestEntity.dto'
import { RatingEntity } from 'src/consultations/dto/RatingEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { UserEntity } from './UserEntity.dto'

export class UserDetails extends UserEntity {
  presentations: (ConsultationEntity & {
    subject: SubjectEntity
    ratings: (RatingEntity & { rater: UserEntity })[]
  })[]
  participations: (ConsultationEntity & {
    subject: SubjectEntity
  })[]
  consultaionRequests: (ConsultationRequestEntity & {
    subject: SubjectEntity
  })[]
  avarageRating: number
}
