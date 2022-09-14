import { GroupEntity } from 'src/groups/dto/GroupEntity.dto'
import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ConsultationEntity } from './ConsultationEntity.dto'
import { ConsultationRequestEntity } from './ConsultationRequestEntity.dto'
import { RatingEntity } from './RatingEntity.dto'

export class ConsultationDetailsDto extends ConsultationEntity {
  presentations: {
    averageRating: number
    rating?: RatingEntity
  }[]
  participants: UserEntity[]
  owner: UserEntity
  targetGroups: GroupEntity[]
  subject: SubjectEntity
  request?: ConsultationRequestEntity
}
