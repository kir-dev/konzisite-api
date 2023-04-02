import {
  BadRequestException,
  Body,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiQuery } from '@nestjs/swagger'
import { Major, Prisma } from '@prisma/client'
import { Response } from 'express'
import { createReadStream } from 'fs'
import { EventAttributes, createEvent } from 'ics'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import {
  CurrentUser,
  CurrentUserOptional,
} from 'src/auth/decorator/current-user.decorator'
import {
  JwtAuth,
  JwtOptionalAuthGuard,
} from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { RequestsService } from 'src/requests/requests.service'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { FileExtensionValidator } from 'src/utils/FileExtensionValidator'
import { FileMaxSizeValidator } from 'src/utils/FileMaxSizeValidator'
import { ApiController } from 'src/utils/apiController.decorator'
import { AlertService } from './alert.service'
import { ConsultationsService } from './consultations.service'
import { ConsultationDetailsDto } from './dto/ConsultationDetails.dto'
import { ConsultationEntity } from './dto/ConsultationEntity.dto'
import { ConsultationPreviewDto } from './dto/ConsultationPreview.dto'
import { CreateConsultationDto } from './dto/CreateConsultation.dto'
import { CreateRatingDto } from './dto/CreateRating.dto'
import { HomeDto } from './dto/Home.dto'
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
    private readonly alertService: AlertService,
    private readonly requestsService: RequestsService,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @ApiQuery({
    name: 'major',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
  })
  @Get()
  findAll(
    @Query('major') major?: Major,
    @Query('startDate') startDate?: number,
    @Query('endDate') endDate?: number,
    @CurrentUserOptional() user?: UserEntity,
  ): Promise<ConsultationPreviewDto[]> {
    return this.consultationsService.findAll({
      user,
      major,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate + 60 * 60 * 24 * 1000) : undefined,
    })
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get('home')
  async home(@CurrentUserOptional() user?: UserEntity): Promise<HomeDto> {
    const [consultations, unratedConsultations, requests, alert] =
      await Promise.all([
        this.consultationsService.findAll({
          user,
          limit: 2,
          startDate: new Date(),
        }),
        user
          ? this.consultationsService.findAll({
              user,
              endDate: new Date(),
              unratedOnly: true,
            })
          : Promise.resolve([]),
        this.requestsService.findAll(true, user, 2),
        this.alertService.findFirst(),
      ])
    return { consultations, unratedConsultations, alert, requests }
  }

  @JwtAuth()
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<ConsultationDetailsDto> {
    const participation = await this.participationService.findOne(id, user.id)
    return await this.consultationsService.findOneWithRelations(
      id,
      user,
      participation?.id,
    )
  }

  @JwtAuth()
  @Post()
  async create(
    @Body() createConsultationDto: CreateConsultationDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ConsultationEntity> {
    if (
      new Date(createConsultationDto.startDate) >=
      new Date(createConsultationDto.endDate)
    ) {
      throw new BadRequestException('Érvénytelen dátum!')
    }
    if (createConsultationDto.requestId) {
      const request = await this.requestsService.findOne(
        createConsultationDto.requestId,
      )
      if (
        request === null ||
        request.subject.id !== createConsultationDto.subjectId
      ) {
        throw new BadRequestException('Érvénytelen konzi kérés!')
      }
      if (new Date(createConsultationDto.startDate) > request.expiryDate) {
        throw new BadRequestException(
          'A konzi később kezdődne, mint a megvalósított kérés határideje!',
        )
      }
    }
    return this.consultationsService.create(createConsultationDto, user)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.Update)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ): Promise<ConsultationEntity> {
    if (
      new Date(updateConsultationDto.startDate) >=
      new Date(updateConsultationDto.endDate)
    ) {
      throw new BadRequestException('Érvénytelen dátum!')
    }
    if (updateConsultationDto.requestId) {
      const request = await this.requestsService.findOne(
        updateConsultationDto.requestId,
      )
      if (
        request === null ||
        request.subject.id !== updateConsultationDto.subjectId
      ) {
        throw new BadRequestException('Érvénytelen konzi kérés!')
      }
      if (new Date(updateConsultationDto.startDate) > request.expiryDate) {
        throw new BadRequestException(
          'A konzi később kezdődne, mint a megvalósított kérés határideje!',
        )
      }
    }
    return this.consultationsService.update(id, updateConsultationDto)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.Delete)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConsultationEntity> {
    return await this.consultationsService.remove(id)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.JoinConsultation)
  @Post(':id/join')
  async join(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<ParticipationEntity> {
    try {
      return await this.participationService.create({
        consultationId: id,
        userId: user.id,
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException(
            'A felhasználó már jelentkezett a konzultációra!',
          )
        }
      }
      throw e
    }
  }

  @JwtAuth()
  @Post(':id/leave')
  async leave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ): Promise<ParticipationEntity> {
    const participation = await this.participationService.findOne(id, user.id)
    if (participation === null) {
      throw new BadRequestException(
        'Nem vagy résztvevője ennek a konzultációnak!',
      )
    }

    return this.participationService.remove(participation.id)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.JoinConsultation)
  @Post(':id/rate')
  async rate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() { ratedUserId, ...ratingDto }: CreateRatingDto,
  ): Promise<RatingEntity> {
    const consultation = await this.consultationsService.findOne(id, user)

    const participation = await this.participationService.findOne(id, user.id)
    if (participation === null) {
      throw new BadRequestException(
        'Nem vagy résztvevője ennek a konzultációnak!',
      )
    }

    const presentation = await this.presentationService.findOne(id, ratedUserId)
    if (presentation === null) {
      throw new BadRequestException(
        'Ez a felhasználó nem előadója ennek a konzultációnak!',
      )
    }

    if (consultation.startDate > new Date()) {
      throw new BadRequestException('A konzultáció még nem kezdődött el!')
    }

    try {
      return await this.ratingService.create({
        participationId: participation.id,
        presentationId: presentation.id,
        ...ratingDto,
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Ezt az előadót már értékelted!')
        }
      }
      throw e
    }
  }

  @JwtAuth()
  @RequiredPermission(Permissions.JoinConsultation)
  @Patch(':id/rate')
  async editRating(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Body() { ratedUserId, ...ratingDto }: CreateRatingDto,
  ): Promise<RatingEntity> {
    const participation = await this.participationService.findOne(id, user.id)
    if (participation === null) {
      throw new BadRequestException(
        'Nem vagy résztvevője ennek a konzultációnak!',
      )
    }

    const presentation = await this.presentationService.findOne(id, ratedUserId)
    if (presentation === null) {
      throw new BadRequestException(
        'Ez a felhasználó nem előadója ennek a konzultációnak!',
      )
    }

    const rating = await this.ratingService.findByIds(
      presentation.id,
      participation.id,
    )
    if (rating === null) {
      throw new BadRequestException('Ez az értékelés nem létezik!')
    }

    return this.ratingService.update(rating.id, {
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
              ? new BadRequestException('Érvénytelen azonosító')
              : null,
            `konzi_${req.params.id}_jegyzet${extname(file.originalname)}`,
          )
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileMaxSizeValidator({ maxSize: 10_000_000 }),
          new FileExtensionValidator({
            allowedExtensions: [
              '.jpg',
              '.jpeg',
              '.png',
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
    return await this.consultationsService.updateFileName(id, file.filename)
  }

  @Patch(':id/deleteFile')
  @RequiredPermission(Permissions.Update)
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    return await this.consultationsService.removeFileName(id)
  }

  @JwtAuth()
  @RequiredPermission(Permissions.DownloadFile)
  @Get(':id/file')
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: UserEntity,
  ): Promise<StreamableFile> {
    const consultation = await this.consultationsService.findOne(id, user)
    if (consultation.archived) {
      throw new NotFoundException(
        'Ez a fájl törölve lett, mert a konzultáció amihez tartozott, archiválásra került.',
      )
    }
    if (consultation.fileName) {
      res.set({
        'Content-Disposition': `attachment; filename="${consultation.fileName}"`,
      })
      const steamableFile = new StreamableFile(
        createReadStream(join(process.cwd(), '/static', consultation.fileName)),
      )
      steamableFile.setErrorHandler((err, response) => {
        response.statusCode = HttpStatus.NOT_FOUND
        response.send(
          JSON.stringify({
            statusCode: HttpStatus.NOT_FOUND,
            message: 'A fájl törölve lett',
          }),
        )
      })
      return steamableFile
    }
    throw new NotFoundException('Ehhez a konzultációhoz nincs feltöltve fájl!')
  }

  @JwtAuth()
  @Get(':id/ics')
  async getCalendar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
    @Res() res: Response,
  ) {
    const consultation = await this.consultationsService.findOne(id, user)
    const eventOptions: EventAttributes = {
      title: consultation.name,
      description: consultation.descMarkdown,
      start: [
        consultation.startDate.getFullYear(),
        consultation.startDate.getMonth() + 1,
        consultation.startDate.getDate(),
        consultation.startDate.getHours(),
        consultation.startDate.getMinutes(),
      ],
      end: [
        consultation.endDate.getFullYear(),
        consultation.endDate.getMonth() + 1,
        consultation.endDate.getDate(),
        consultation.endDate.getHours(),
        consultation.endDate.getMinutes(),
      ],
      location: consultation.location,
      url: `${process.env.FRONTEND_HOST}/consultations/${consultation.id}`,
    }

    res.set({
      'Content-Disposition':
        'attachment; filename="konzultacio_' + consultation.id + '.ics"',
      'Content-type': 'text/calendar',
    })
    createEvent(eventOptions, (err, value) => {
      if (err) {
        throw new InternalServerErrorException(
          'Hiba a naptár fájl generálása közben.',
        )
      }
      res.send(value)
    })
  }
}
