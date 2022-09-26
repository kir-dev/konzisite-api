import { GroupEntity } from 'src/groups/dto/GroupEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ConsultationEntity } from './ConsultationEntity.dto'
import { ConsultationRequestEntity } from './ConsultationRequestEntity.dto'
import { RatingEntity } from './RatingEntity.dto'

export class Presentation extends UserEntity {
  averageRating: number
  rating?: RatingEntity
}

export class ConsultationDetailsDto extends ConsultationEntity {
  presentations: Presentation[]
  participants: UserEntity[]
  owner: UserEntity
  targetGroups: GroupEntity[]
  subject: SubjectEntity
  request?: ConsultationRequestEntity
}
