import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { PrismaModule } from 'src/prisma/prisma.module'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CaslAbilityFactory } from './casl-ability.factory'

describe('AuthController', () => {
  let controller: AuthController

  let fakejwtService: Partial<JwtService>
  let fakeUserService: Partial<UsersService>

  beforeEach(async () => {
    fakejwtService = {
      sign: jest.fn().mockReturnValue('token'),
    }

    fakeUserService = {
      findByAuthSchId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(null),
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        CaslAbilityFactory,
        {
          provide: JwtService,
          useValue: fakejwtService,
        },
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('oauthRedirect', () => {
    it('should create a token for the user', async () => {
      const user: User = {
        id: 1,
        isAdmin: false,
        authSchId: '1',
        email: 'noreply@example.com',
        firstName: 'test',
        fullName: 'test user',
      }
      await controller.oauthRedirect(user)
      expect(fakejwtService.sign).toHaveBeenCalledTimes(1)
      expect(fakejwtService.sign).toHaveBeenCalledWith(user, expect.anything())
    })

    it('should include a jwt token in the url', async () => {
      const JWT_TOKEN = 'jwt-token'
      fakejwtService.sign = jest.fn().mockReturnValue(JWT_TOKEN)
      const { url } = await controller.oauthRedirect({} as any)
      expect(url).toContain('jwt=' + JWT_TOKEN)
    })
  })
})
