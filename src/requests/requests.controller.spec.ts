import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RequestsController } from './requests.controller'
import { RequestsService } from './requests.service'

describe('RequestsController', () => {
  let controller: RequestsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      controllers: [RequestsController],
      providers: [RequestsService],
    }).compile()

    controller = module.get<RequestsController>(RequestsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
