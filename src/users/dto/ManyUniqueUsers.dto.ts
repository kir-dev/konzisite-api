import { IsInt, Min } from 'class-validator'

export class ManyUniqueUsersDto {
  @IsInt({ each: true })
  @Min(1, { each: true })
  userIds: number[]
}
