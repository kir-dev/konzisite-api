import { Alert } from '@prisma/client'
import { RequestPreviewDto } from 'src/requests/dto/RequestPreview.dto'
import { ConsultationPreviewDto } from './ConsultationPreview.dto'

export class HomeDto {
  consultations: ConsultationPreviewDto[]
  requests: RequestPreviewDto[]
  unratedConsultations: ConsultationPreviewDto[]
  alert?: Alert
}
