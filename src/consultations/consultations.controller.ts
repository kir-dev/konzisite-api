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
import { ConsultationPreviewDto } from './dto/ConsultationPreview.dto'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { CreateRatingDto } from './dto/CreateRating.dto'
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

  @Get()
  async findAll(): Promise<ConsultationPreviewDto[]> {
    return this.consultationsService.findAll()
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const participation = await this.participationService.findOne(+id, user.id)
    return this.consultationsService.findOne(
      +id,
      participation?.id || undefined,
    )
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(+id, updateConsultationDto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(+id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: User) {
    return this.participationService.create({
      consultationId: +id,
      userId: user.id,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rate')
  async rate(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() ratingDto: CreateRatingDto,
  ) {
    const participation = await this.participationService.findOne(+id, user.id)
    const presentation = await this.presentationService.findOne(
      +id,
      ratingDto.ratedUserId,
    )
    return this.ratingService.create({
      participationId: participation.id,
      presentationId: presentation.id,
      text: ratingDto.text,
      value: ratingDto.value,
      anonymous: ratingDto.anonymous,
    })
  }
}
