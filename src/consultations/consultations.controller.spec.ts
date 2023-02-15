import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AlertService } from './alert.service'
import { ConsultationsController } from './consultations.controller'
import { ConsultationsService } from './consultations.service'
import { ParticipationService } from './participation.service'
import { PresentationService } from './presentation.service'
import { RatingService } from './rating.service'

describe('ConsultationsController', () => {
  let controller: ConsultationsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AuthModule],
      controllers: [ConsultationsController],
      providers: [
        ConsultationsService,
        RatingService,
        ParticipationService,
        PresentationService,
        AlertService,
      ],
    }).compile()

    controller = module.get<ConsultationsController>(ConsultationsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
