import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { ConsultationEntity } from './ConsultationEntity.dto'

export class PresentationPreview extends PublicUser {
  averageRating: number
}

export class ConsultationPreviewDto extends ConsultationEntity {
  subject: SubjectEntity
  presentations: PresentationPreview[]
}
