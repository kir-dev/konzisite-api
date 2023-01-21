import { IsEnum, IsOptional } from 'class-validator'
import { Major } from './SubjectEntity.dto'

export class UpdateSubjectDto {
  @IsOptional()
  name?: string

  @IsOptional()
  code?: string

  @IsOptional()
  @IsEnum(Major, { each: true })
  majors?: Major[]
}
