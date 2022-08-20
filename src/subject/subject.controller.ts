import {
  Body,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ApiController } from 'src/utils/apiController.decorator'
import { SubjectService } from './subject.service'

@ApiController('subject')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  create(@Body() createSubjectDto: Prisma.SubjectCreateInput) {
    return this.subjectService.create(createSubjectDto)
  }

  @Get()
  findAll() {
    return this.subjectService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: Prisma.SubjectUpdateInput,
  ) {
    return this.subjectService.update(id, updateSubjectDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectService.remove(id)
  }
}
