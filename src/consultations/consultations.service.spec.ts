import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaService } from '../prisma/prisma.service'
import { ConsultationsService } from './consultations.service'

describe('ConsultationsService', () => {
  let service: ConsultationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [PrismaService, ConsultationsService],
    }).compile()

    service = module.get<ConsultationsService>(ConsultationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
