import { PartialType } from '@nestjs/swagger'
import { CreateSubjectDto } from './CreateSubject.dto'

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
