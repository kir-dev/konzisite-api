import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { SubjectService } from './subject.service'

describe('SubjectService', () => {
  let service: SubjectService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [SubjectService],
    }).compile()

    service = module.get<SubjectService>(SubjectService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
