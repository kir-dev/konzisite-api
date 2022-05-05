import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { SubjectService } from './subject.service'

@Controller('subject')
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
  findOne(@Param('id') id: string) {
    return this.subjectService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: Prisma.SubjectUpdateInput,
  ) {
    return this.subjectService.update(+id, updateSubjectDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectService.remove(+id)
  }
}
