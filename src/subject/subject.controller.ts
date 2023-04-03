import {
  BadRequestException,
  Body,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiQuery } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { readFileSync, unlink } from 'fs'
import { diskStorage } from 'multer'
import { parse } from 'papaparse'
import { join } from 'path'
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { CurrentUser } from 'src/auth/decorator/current-user.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { UserEntity } from 'src/users/dto/UserEntity.dto'
import { CreateManyResponse } from 'src/utils/CreateManyResponse.dto'
import { FileExtensionValidator } from 'src/utils/FileExtensionValidator'
import { FileMaxSizeValidator } from 'src/utils/FileMaxSizeValidator'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateSubjectDto } from './dto/CreateSubject.dto'
import { Major, SubjectEntity } from './dto/SubjectEntity.dto'
import { UpdateSubjectDto } from './dto/UpdateSubject.dto'
import { SubjectService } from './subject.service'

@JwtAuth()
@ApiController('subjects')
@AuthorizationSubject('Subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @ApiQuery({
    name: 'search',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @Get()
  findAll(
    @Query('search') nameFilter?: string,
    @Query('limit') limit?: number,
  ): Promise<SubjectEntity[]> {
    if (limit < 0) {
      throw new BadRequestException('Érvénytelen limit paraméter!')
    }
    return this.subjectService.findAll(nameFilter, limit)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const res = await this.subjectService.findOne(id)
    if (res === null) {
      throw new NotFoundException('A tárgy nem található!')
    }
    return res
  }

  @Post()
  @RequiredPermission(Permissions.Create)
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    try {
      return await this.subjectService.create(createSubjectDto)
    } catch {
      throw new BadRequestException('Ez a tárgykód már létezik!')
    }
  }

  @Post('import')
  @RequiredPermission(Permissions.Create)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/',
        filename: (_req, _file, callback) => {
          callback(null, 'importdata.csv')
        },
      }),
    }),
  )
  async import(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileMaxSizeValidator({ maxSize: 1_000_000 }),
          new FileExtensionValidator({
            allowedExtensions: ['.csv'],
          }),
        ],
      }),
    ) // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _file: Express.Multer.File,
  ): Promise<CreateManyResponse> {
    const file_contents = readFileSync(
      join(process.cwd(), '/static/importdata.csv'),
    ).toString()

    const subjects = await parse<CreateSubjectDto>(file_contents, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field: string) => {
        if (!['code', 'name', 'majors'].includes(field)) {
          throw new BadRequestException(`Érvénytelen mező: ${field}!`)
        }
        if (field === 'majors') {
          return value.split(',').map((m) => {
            const major = Major[m]
            if (!major) {
              throw new BadRequestException(`Érvénytelen szak: ${m}`)
            }
            return major
          })
        }
        return value
      },
    })

    try {
      return await this.subjectService.createMany(subjects.data)
    } catch {
      throw new BadRequestException(
        'Érvénytelen formátum vagy már létező tárgykód!',
      )
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unlink(join(process.cwd(), '/static/importdata.csv'), () => {})
    }
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    try {
      return await this.subjectService.update(id, updateSubjectDto)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new NotFoundException('A tárgy nem található!')
        }
        if (e.code === 'P2002') {
          throw new BadRequestException('Ez a tárgykód már létezik!')
        }
      }
    }
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.subjectService.remove(id)
    } catch {
      throw new NotFoundException('A tárgy nem található!')
    }
  }

  @Post(':id/subscribe')
  async subscribe(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) subjectId: number,
  ) {
    try {
      return await this.subjectService.subscribe(user, subjectId)
    } catch {
      throw new BadRequestException('Hiba a feliratkozásban!')
    }
  }

  @Post(':id/unsubscribe')
  async unsubscribe(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseIntPipe) subjectId: number,
  ) {
    try {
      return await this.subjectService.unsubscribe(user, subjectId)
    } catch {
      throw new BadRequestException('Hiba a leiratkozásban!')
    }
  }
}
