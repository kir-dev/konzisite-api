import { IsInt, Min } from 'class-validator'

export class UniqueUserDto {
  @IsInt()
  @Min(1)
  userId: number
}
