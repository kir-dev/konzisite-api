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
import { ConsultationsService } from './consultations.service'

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  create(@Body() createConsultationDto: Prisma.ConsultationCreateInput) {
    return this.consultationsService.create(createConsultationDto)
  }

  @Get()
  findAll() {
    return this.consultationsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(+id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: Prisma.ConsultationUpdateInput,
  ) {
    return this.consultationsService.update(+id, updateConsultationDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(+id)
  }
}
