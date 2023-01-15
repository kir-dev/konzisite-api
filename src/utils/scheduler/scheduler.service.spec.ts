import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SchedulerService } from './scheduler.service'

describe('SchedulerService', () => {
  let service: SchedulerService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [SchedulerService],
    }).compile()

    service = module.get<SchedulerService>(SchedulerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
