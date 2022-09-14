import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ConsultationEntity } from './ConsultationEntity.dto'

export class ConsultationPreviewDto extends ConsultationEntity {
  subject: SubjectEntity
  presentations: (UserEntity & {
    averageRating: number
  })[]
}
