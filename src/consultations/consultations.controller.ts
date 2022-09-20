import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { CurrentUser } from 'src/current-user.decorator'
import { UserDto } from 'src/users/dto/User.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { ConsultationsService } from './consultations.service'
import { ConsultationDetailsDto } from './dto/ConsultationDetails.dto'
import { ConsultationPreviewDto } from './dto/ConsultationPreview.dto'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { CreateRatingDto } from './dto/CreateRating.dto'
import { UpdateConsultationDto } from './dto/UpdateConsultation.dto'
import { ParticipationService } from './participation.service'
import { PresentationService } from './presentation.service'
import { RatingService } from './rating.service'

@ApiController('consultations')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly participationService: ParticipationService,
    private readonly presentationService: PresentationService,
    private readonly ratingService: RatingService,
  ) {}

  @JwtAuth()
  @Post()
  create(
    @Body() createConsultationDto: CreateConsultationDto,
    @CurrentUser() user: UserDto,
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

  @JwtAuth()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserDto,
  ): Promise<ConsultationDetailsDto> {
    const participation = await this.participationService.findOne(id, user.id)
    return this.consultationsService.findOne(id, participation?.id)
  }

  @JwtAuth()
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(id, updateConsultationDto)
  }

  @JwtAuth()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.consultationsService.remove(id)
  }

  @JwtAuth()
  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: UserDto) {
    return this.participationService.create({
      consultationId: +id,
      userId: user.id,
    })
  }

  @JwtAuth()
  @Post(':id/rate')
  async rate(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
    @Body() { ratedUserId, ...ratingDto }: CreateRatingDto,
  ) {
    const participation = await this.participationService.findOne(+id, user.id)
    const presentation = await this.presentationService.findOne(
      +id,
      ratedUserId,
    )
    return this.ratingService.create({
      participationId: participation.id,
      presentationId: presentation.id,
      ...ratingDto,
    })
  }
}
