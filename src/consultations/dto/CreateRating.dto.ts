import { OmitType } from '@nestjs/swagger'
import { IsBoolean, IsInt, Min } from 'class-validator'
import { RatingEntity } from './RatingEntity.dto'

export class CreateRatingDto extends OmitType(RatingEntity, ['id']) {
  @IsInt()
  @Min(1)
  ratedUserId: number

  @IsBoolean()
  anonymous: boolean
}
