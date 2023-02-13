import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { RequestEntity } from './RequestEntity.dto'

export class RequestDetailsDto extends RequestEntity {
  initializer: PublicUser
  subject: SubjectEntity
  supporters: PublicUser[]
  consultations: ConsultationEntity[]
}
