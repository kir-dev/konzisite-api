import { RequestPreviewDto } from 'src/requests/dto/RequestPreview.dto'
import { Alert } from './Alert.dto'
import { ConsultationPreviewDto } from './ConsultationPreview.dto'

export class HomeDto {
  consultations: ConsultationPreviewDto[]
  requests: RequestPreviewDto[]
  unratedConsultations: ConsultationPreviewDto[]
  alert?: Alert
}
