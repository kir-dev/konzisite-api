import {
  Body,
  Delete,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Prisma } from '@prisma/client'
import { createReadStream, unlink } from 'fs'
import { diskStorage } from 'multer'
import { CsvParser, ParsedData } from 'nest-csv-parser'
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
import { ImportedSubjectDto } from './dto/ImportedSubject.dto'
import { Major } from './dto/SubjectEntity.dto'
import { UpdateSubjectDto } from './dto/UpdateSubject.dto'
import { SubjectService } from './subject.service'

@JwtAuth()
@ApiController('subjects')
@AuthorizationSubject('Subject')
export class SubjectController {
  constructor(
    private readonly subjectService: SubjectService,
    private readonly csvParser: CsvParser,
  ) {}

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
    )
    _file: // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Express.Multer.File,
  ): Promise<CreateManyResponse> {
    const stream = createReadStream(
      join(process.cwd(), '/static/importdata.csv'),
    )
    const rawSubjects: ParsedData<ImportedSubjectDto> =
      await this.csvParser.parse(stream, ImportedSubjectDto)
    const realSubjects: CreateSubjectDto[] = rawSubjects.list.map((s) => ({
      code: s.code,
      name: s.name,
      majors: s.majors.split(',').map((m) => {
        const major = Major[m]
        if (!major) {
          throw new HttpException(
            `Érvénytelen szak: ${m}`,
            HttpStatus.BAD_REQUEST,
          )
        }
        return major
      }),
    }))
    try {
      const { count } = await this.subjectService.createMany(realSubjects)
      return { count }
    } catch {
      throw new HttpException(
        'Egy már létező kódú tárgyat próbáltál importálni!',
        HttpStatus.BAD_REQUEST,
      )
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unlink(join(process.cwd(), '/static/importdata.csv'), () => {})
    }
  }

  @RequiredPermission(Permissions.Create)
  @Header('Content-Disposition', 'attachment; filename="example_import.csv"')
  @Get('example')
  async getExampleFile(): Promise<StreamableFile> {
    const steamableFile = new StreamableFile(
      createReadStream(join(process.cwd(), '/static/example_import.csv')),
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

  @Get()
  @RequiredPermission(Permissions.Read)
  findAll() {
    return this.subjectService.findAll()
  }

  @Get(':id')
  @RequiredPermission(Permissions.Read)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const res = await this.subjectService.findOne(id)
    if (res === null) {
      throw new HttpException('A tárgy nem található!', HttpStatus.NOT_FOUND)
    }
    return res
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
