import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ReportsService } from './reports.service'

describe('ReportsService', () => {
  let service: ReportsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ReportsService],
    }).compile()

    service = module.get<ReportsService>(ReportsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
