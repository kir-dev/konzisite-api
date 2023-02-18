import { Alert, ConsultationRequest } from '@prisma/client'
import { ConsultationPreviewDto } from './ConsultationPreview.dto'

export class HomeDto {
  consultations: ConsultationPreviewDto[]
  requests: ConsultationRequest[] // TODO change to dto after #124 is merged
  unratedConsultations: ConsultationPreviewDto[]
  alert?: Alert
}
