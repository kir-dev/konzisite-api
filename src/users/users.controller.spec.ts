import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@prisma/client'
import { AuthModule } from 'src/auth/auth.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController

  let fakeUsersService: Partial<UsersService>

  beforeEach(async () => {
    fakeUsersService = {
      update: jest.fn().mockResolvedValue({
        id: 1,
        authSchId: '1',
        email: 'example@example.com',
        firstName: 'foo',
        lastName: 'bar',
      } as User),
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
