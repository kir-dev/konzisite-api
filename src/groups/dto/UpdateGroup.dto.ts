import { IsNotEmpty, MaxLength } from 'class-validator'

export class UpdateGroupDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string
}
