import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { createReadStream, unlink } from 'fs'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { CurrentUser } from 'src/current-user.decorator'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { ApiController } from 'src/utils/apiController.decorator'
import { FileExtensionValidator } from 'src/utils/FileExtensionValidator'
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
@AuthorizationSubject('Consultation')
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
  @RequiredPermission(Permissions.Update)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ): Promise<ConsultationEntity> {
    return this.consultationsService.update(id, updateConsultationDto)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.Delete)
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

  @JwtAuth()
  @RequiredPermission(Permissions.Update)
  @Patch(':id/file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/',
        filename: (req, file, callback) => {
          callback(
            isNaN(parseInt(req.params.id))
              ? new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
              : null,
            `attch_${req.params.id}${extname(file.originalname)}`,
          )
        },
      }),
      limits: {
        fileSize: 10000000,
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileExtensionValidator({
            allowedExtensions: [
              '.jpg',
              '.jpeg',
              '.pdf',
              '.docx',
              '.pptx',
              '.zip',
            ],
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConsultationEntity> {
    try {
      return await this.consultationsService.updateFileName(id, file.filename)
    } catch {
      unlink(join(process.cwd(), '/static', file.filename), () => {})
      throw new HttpException('Consultation not found!', HttpStatus.NOT_FOUND)
    }
  }

  @JwtAuth()
  @RequiredPermission(Permissions.DownloadFile)
  @Get(':id/file')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const consultation = await this.consultationsService.findOne(id)
    if (consultation.archived) {
      throw new HttpException(
        'The file uploaded for this consultation has been deleted because the consultation has been archived.',
        HttpStatus.NOT_FOUND,
      )
    }
    if (consultation.fileName) {
      res.set({
        'Content-Disposition': `attachment; filename="${consultation.fileName}"`,
      })
      return new StreamableFile(
        createReadStream(join(process.cwd(), '/static', consultation.fileName)),
      )
    }
    throw new HttpException(
      'No file uploaded for this consultation',
      HttpStatus.NOT_FOUND,
    )
  }
}
