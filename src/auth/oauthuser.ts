import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'

export class OAuthUser {
  @IsNotEmpty()
  displayName: string

  @IsNotEmpty()
  givenName: string

  @IsUUID('all')
  internal_id: string

  @IsEmail()
  @IsOptional()
  mail?: string

  constructor(partial: Partial<OAuthUser>) {
    Object.assign(this, partial)
  }
}
