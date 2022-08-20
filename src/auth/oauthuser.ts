import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator'

export class OAuthUser {
  @IsNotEmpty()
  sn: string

  @IsNotEmpty()
  givenName: string

  @IsUUID('all')
  internal_id: string

  @IsEmail()
  mail: string

  constructor(partial: Partial<OAuthUser>) {
    Object.assign(this, partial)
  }
}
