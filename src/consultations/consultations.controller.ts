import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { CurrentUser } from 'src/current-user.decorator'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { ConsultationsService } from './consultations.service'
import { ConsultationDetailsDto } from './dto/ConsultationDetails.dto'
import { ConsultationEntity } from './dto/ConsultationEntity.dto'
import { ConsultationPreviewDto } from './dto/ConsultationPreview.dto'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { CreateRatingDto } from './dto/CreateRating.dto'
import { ParticipationEntity } from './dto/ParticipationEntity.dto'
import { RatingEntity } from './dto/RatingEntity.dto'
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
    @CurrentUser() user: UserEntity,
  ): Promise<ConsultationEntity> {
    return this.consultationsService.create({
      ...createConsultationDto,
      ownerId: user.id,
    })
  }

  @Get()
  findAll(): Promise<ConsultationPreviewDto[]> {
    return this.consultationsService.findAll()
  }

  @JwtAuth()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<ConsultationDetailsDto> {
    const participation = await this.participationService.findOne(id, user.id)
    return this.consultationsService.findOne(id, participation?.id)
  }

  @JwtAuth()
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ): Promise<ConsultationEntity> {
    return this.consultationsService.update(id, updateConsultationDto)
  }

  @JwtAuth()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ConsultationEntity> {
    return this.consultationsService.remove(id)
  }

  @JwtAuth()
  @Post(':id/join')
  join(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<ParticipationEntity> {
    return this.participationService.create({
      consultationId: id,
      userId: user.id,
    })
  }

  @JwtAuth()
  @Post(':id/rate')
  async rate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() { ratedUserId, ...ratingDto }: CreateRatingDto,
  ): Promise<RatingEntity> {
    const participation = await this.participationService.findOne(id, user.id)
    if (participation === null) {
      throw new HttpException(
        'Nem vagy résztvevője ennek a konzultációnak!',
        HttpStatus.BAD_REQUEST,
      )
    }

    const presentation = await this.presentationService.findOne(id, ratedUserId)
    if (presentation === null) {
      throw new HttpException(
        'Ez a felhasználó nem előadója ennek a konzultációnak!',
        HttpStatus.BAD_REQUEST,
      )
    }

    return this.ratingService.create({
      participationId: participation.id,
      presentationId: presentation.id,
      ...ratingDto,
    })
  }
}
