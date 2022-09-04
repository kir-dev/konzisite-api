import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { CurrentUser } from 'src/current-user.decorator'
import { ConsultationsService } from './consultations.service'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'
import { ParticipationService } from './participation.service'
import { PresentationService } from './presentation.service'
import { RatingService } from './rating.service'

@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly participationService: ParticipationService,
    private readonly presentationService: PresentationService,
    private readonly ratingService: RatingService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createConsultationDto: CreateConsultationDto,
    @CurrentUser() user: User,
  ) {
    return this.consultationsService.create({
      ...createConsultationDto,
      ownerId: user.id,
    })
  }

  @Get(':id/presentations')
  findPresenters(@Param('id') id: string) {
    return this.presentationService.findAllByConsultationId(+id)
  }

  @Get()
  findAll() {
    return this.consultationsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(+id, updateConsultationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(+id)
  }
}
