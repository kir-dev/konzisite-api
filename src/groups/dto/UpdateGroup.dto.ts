import { IsNotEmpty } from 'class-validator'

export class UpdateGroupDto {
  @IsNotEmpty()
  name: string
}
