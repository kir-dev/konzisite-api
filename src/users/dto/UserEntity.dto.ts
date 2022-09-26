import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator'

export class UserEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsUUID('all')
  authSchId: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  lastName: string

  @IsEmail()
  @ApiProperty({ example: 'noreply@example.com' })
  email: string

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }
}
