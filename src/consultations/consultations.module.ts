import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RequestsModule } from 'src/requests/requests.module'
import { AlertService } from './alert.service'
import { ConsultationsController } from './consultations.controller'
import { ConsultationsService } from './consultations.service'
import { ParticipationService } from './participation.service'
import { PresentationService } from './presentation.service'
import { RatingService } from './rating.service'

@Module({
  imports: [PrismaModule, AuthModule, RequestsModule],
  controllers: [ConsultationsController],
  providers: [
    ConsultationsService,
    RatingService,
    ParticipationService,
    PresentationService,
    AlertService,
  ],
})
export class ConsultationsModule {}
