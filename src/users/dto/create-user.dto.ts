import { IsNotEmpty, IsString } from 'class-validator';
import { OAuthUser } from 'src/auth/oauthuser';
import { User } from '../entities/user.entity';

export class CreateUserDto implements User {
  constructor(oauthUser: OAuthUser) {
    this.name = oauthUser.displayName;
    this.authSchId = oauthUser.internal_id;
    this.email = oauthUser.mail;
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  authSchId: string;
}
