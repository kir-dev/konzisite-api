import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'

export interface UserReport extends ConsultationReportDateInfo {
  user?: PublicUser
  consultations: ConsultationForReport[]
}

export interface ConsultationReportDateInfo {
  startDate: string
  endDate: string
  currentDateTime: string
}

export interface ConsultationForReport {
  id: number
  name: string
  location: string
  date: string
  startTime: string
  endTime: string
  subject: SubjectEntity
  participants: number
  presentations: (PublicUser & {
    averageRating: number
  })[]
}
