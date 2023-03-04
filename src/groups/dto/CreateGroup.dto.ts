import { IsNotEmpty, MaxLength } from 'class-validator'

export class CreateGroupDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string
}
