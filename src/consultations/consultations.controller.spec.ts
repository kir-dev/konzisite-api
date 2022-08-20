import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ConsultationsController } from './consultations.controller'
import { ConsultationsService } from './consultations.service'

describe('ConsultationsController', () => {
  let controller: ConsultationsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [ConsultationsController],
      providers: [ConsultationsService],
    }).compile()

    controller = module.get<ConsultationsController>(ConsultationsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
