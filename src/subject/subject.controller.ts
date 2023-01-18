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
import { Permissions } from 'src/auth/casl-ability.factory'
import { AuthorizationSubject } from 'src/auth/decorator/authorizationSubject.decorator'
import { JwtAuth } from 'src/auth/decorator/jwtAuth.decorator'
import { RequiredPermission } from 'src/auth/decorator/requiredPermission'
import { ApiController } from 'src/utils/apiController.decorator'
import { CreateSubjectDto } from './dto/CreateSubject.dto'
import { UpdateSubjectDto } from './dto/UpdateSubject.dto'
import { SubjectService } from './subject.service'

@JwtAuth()
@ApiController('subjects')
@AuthorizationSubject('Subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

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
