import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator'

export class UserEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsUUID('all')
  authSchId: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  fullName: string

  @IsEmail()
  @ApiProperty({ example: 'noreply@example.com' })
  email: string

  @IsBoolean()
  @IsOptional()
  isAdmin: boolean

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }
}
