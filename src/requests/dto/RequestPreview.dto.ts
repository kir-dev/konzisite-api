import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'
import { RequestEntity } from './RequestEntity.dto'

export class RequestPreviewDto extends RequestEntity {
  initializer: PublicUser
  subject: SubjectEntity
  supporterCount: number
  consultationCount: number
}
