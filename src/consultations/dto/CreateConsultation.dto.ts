export class CreateConsultationDto {
  name: string
  ownerId?: number
  subjectId: number
  location: string
  startDate: Date
  endDate: Date
  descMarkdown: string
  presenterIds: number[]
  targetGroupIds: number[]
  requestId?: number
}
