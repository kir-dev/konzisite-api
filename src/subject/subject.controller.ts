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
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateManyResponse } from 'src/utils/CreateManyResponse.dto'
import { FileExtensionValidator } from 'src/utils/FileExtensionValidator'
import { FileMaxSizeValidator } from 'src/utils/FileMaxSizeValidator'
import { CreateSubjectDto } from './dto/CreateSubject.dto'
import { Major } from './dto/SubjectEntity.dto'
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
  @Get()
  findAll(@Query('search') nameFilter: string) {
    return this.subjectService.findAll(nameFilter)
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const res = await this.subjectService.findOne(id)
    if (res === null) {
      throw new HttpException('A tárgy nem található!', HttpStatus.NOT_FOUND)
    }
    return res
  }

  @Post()
  @RequiredPermission(Permissions.Create)
  async create(@Body() createSubjectDto: CreateSubjectDto) {
    try {
      return await this.subjectService.create(createSubjectDto)
    } catch {
      throw new HttpException(
        'Ez a tárgykód már létezik!',
        HttpStatus.BAD_REQUEST,
      )
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
          throw new HttpException(
            `Érvénytelen mező: ${field}!`,
            HttpStatus.BAD_REQUEST,
          )
        }
        if (field === 'majors') {
          return value.split(',').map((m) => {
            const major = Major[m]
            if (!major) {
              throw new HttpException(
                `Érvénytelen szak: ${m}`,
                HttpStatus.BAD_REQUEST,
              )
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
      throw new HttpException(
        'Érvénytelen formátum vagy már létező tárgykód!',
        HttpStatus.BAD_REQUEST,
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
          throw new HttpException(
            'A tárgy nem található!',
            HttpStatus.NOT_FOUND,
          )
        }
        if (e.code === 'P2002') {
          throw new HttpException(
            'Ez a tárgykód már létezik!',
            HttpStatus.BAD_REQUEST,
          )
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
      throw new HttpException('A tárgy nem található!', HttpStatus.NOT_FOUND)
    }
  }
}
