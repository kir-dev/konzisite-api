import { GroupEntity } from 'src/groups/dto/GroupEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { ConsultationEntity } from './ConsultationEntity.dto'
import { ConsultationRequestEntity } from './ConsultationRequestEntity.dto'
import { RatingEntity } from './RatingEntity.dto'

export class Presentation extends PublicUser {
  averageRating: number
  rating?: RatingEntity
}

export class ConsultationDetailsDto extends ConsultationEntity {
  presentations: Presentation[]
  participants: PublicUser[]
  owner: PublicUser
  targetGroups: GroupEntity[]
  subject: SubjectEntity
  request?: ConsultationRequestEntity
}
