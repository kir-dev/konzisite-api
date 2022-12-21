import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ConsultationRequestService } from './consultationRequest.service'
import { ConsultationsController } from './consultations.controller'
import { ConsultationsService } from './consultations.service'
import { ParticipationService } from './participation.service'
import { PresentationService } from './presentation.service'
import { RatingService } from './rating.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ConsultationsController],
  providers: [
    ConsultationsService,
    RatingService,
    ParticipationService,
    PresentationService,
    ConsultationRequestService,
  ],
})
export class ConsultationsModule {}
