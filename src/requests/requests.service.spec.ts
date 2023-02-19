import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RequestsService } from './requests.service'

describe('RequestsService', () => {
  let service: RequestsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [RequestsService],
    }).compile()

    service = module.get<RequestsService>(RequestsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
