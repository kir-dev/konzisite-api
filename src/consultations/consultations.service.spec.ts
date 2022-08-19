import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from '../prisma/prisma.service'
import { ConsultationsService } from './consultations.service'

describe('ConsultationsService', () => {
  let service: ConsultationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ConsultationsService],
    }).compile()

    service = module.get<ConsultationsService>(ConsultationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
