import { SubjectEntity } from 'src/subject/dto/SubjectEntity.dto'
import { PublicUser } from 'src/users/dto/PublicUser.dto'

export interface Report extends ConsultationReportDateInfo {
  user?: PublicUser
  consultations: ConsultationForReport[]
  konzisiteUrl: string
  validated: boolean
  validateUrl?: string
}

export interface ConsultationReportDateInfo {
  startDate: string
  endDate: string
  currentDateTime: string
  currentTimestamp: number
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
    averageRating: string
  })[]
}
