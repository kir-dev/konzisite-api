import { OmitType } from '@nestjs/swagger'
import { IsInt, IsOptional, Min } from 'class-validator'
import { ConsultationEntity } from './ConsultationEntity.dto'

export class CreateConsultationDto extends OmitType(ConsultationEntity, [
  'id',
]) {
  @IsInt()
  @IsOptional()
  ownerId?: number

  @IsInt()
  @Min(1)
  subjectId: number

  @IsInt({ each: true })
  presenterIds: number[]

  @IsInt({ each: true })
  targetGroupIds: number[]

  @IsInt()
  @IsOptional()
  requestId?: number
}
