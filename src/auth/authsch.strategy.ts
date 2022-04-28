import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { OAuthUser } from './oauthuser';

const AUTH_SCH_URL = 'https://auth.sch.bme.hu';

@Injectable()
export class AuthschStrategy extends PassportStrategy(Strategy, 'authsch') {
  constructor(
    private httpService: HttpService,
    private usersService: UsersService,
  ) {
    super({
      authorizationURL: `${AUTH_SCH_URL}/site/login`,
      tokenURL: `${AUTH_SCH_URL}/oauth2/token`,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/callback',
      scope: ['basic', 'sn', 'givenName', 'mail'], // ?? niifEduPersonAttendedCourse = hallgatott tárgyak
      // Hallgató által jelenleg hallgatott kurzusok kódjai. Példa: "BMEVIAUA218;BMEVIIIA316"
    });
  }

  async validate(accessToken: string): Promise<any> {
    const responseUser: OAuthUser = (
      await firstValueFrom(
        this.httpService.get(
          `${AUTH_SCH_URL}/api/profile?access_token=${accessToken}`,
        ),
      )
    ).data;

    const user = await this.usersService.findByAuthSchId(
      responseUser.internal_id,
    );
    if (user) return user;
    else {
      const newUser = await this.usersService.create(
        {
          authSchId: responseUser.internal_id,
          firstName: responseUser.givenName,
          lastName: responseUser.sn,
          email: responseUser.mail
        }
      );
      return newUser;
    }
  }
}
