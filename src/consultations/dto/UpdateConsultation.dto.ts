import { PartialType } from '@nestjs/swagger'
import { CreateConsultationDto } from './CreateConsultation.dto'

export class UpdateConsultationDto extends PartialType(CreateConsultationDto) {}
