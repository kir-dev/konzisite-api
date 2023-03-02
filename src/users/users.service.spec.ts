import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let fakejwtService: Partial<JwtService>

  beforeEach(async () => {
    fakejwtService = {
      sign: jest.fn().mockReturnValue('token'),
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: fakejwtService,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
