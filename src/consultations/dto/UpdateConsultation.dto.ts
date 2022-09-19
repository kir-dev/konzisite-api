export class UpdateConsultationDto {
  name?: string
  subjectId?: number
  location?: string
  startDate?: Date
  endDate?: Date
  descMarkDown?: string
  presenterIds?: number[]
  targetGroupIds?: number[]
}
