import {
  Body,
  Delete,
  Get,
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
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectService.create(createSubjectDto)
  }

  @Get()
  @RequiredPermission(Permissions.Read)
  findAll() {
    return this.subjectService.findAll()
  }

  @Get(':id')
  @RequiredPermission(Permissions.Read)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id)
  }

  @Patch(':id')
  @RequiredPermission(Permissions.Update)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectService.update(id, updateSubjectDto)
  }

  @Delete(':id')
  @RequiredPermission(Permissions.Delete)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id)
  }
}
