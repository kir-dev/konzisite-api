import { OmitType } from '@nestjs/swagger'
import { SubjectEntity } from './SubjectEntity.dto'

export class CreateSubjectDto extends OmitType(SubjectEntity, ['id']) {}
