import { IsInt } from 'class-validator'

export class ManyUniqueUsersDto {
  @IsInt({ each: true })
  userIds: number[]
}
