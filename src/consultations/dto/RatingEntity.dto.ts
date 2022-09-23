import { IsInt, IsString, Max, Min } from 'class-validator'

export class RatingEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsString()
  text: string

  @IsInt()
  @Min(1)
  @Max(5)
  value: number
}
