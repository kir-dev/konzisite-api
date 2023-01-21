import { IsEnum, IsNotEmpty } from 'class-validator'
import { Major } from './SubjectEntity.dto'

export class CreateSubjectDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  @IsEnum(Major, { each: true })
  majors: Major[]
}
