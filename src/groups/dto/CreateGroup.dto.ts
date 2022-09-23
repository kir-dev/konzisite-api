import { IsNotEmpty } from 'class-validator'

export class CreateGroupDto {
  @IsNotEmpty()
  name: string
}
