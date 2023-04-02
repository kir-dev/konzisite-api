import { ConsultationEntity } from 'src/consultations/dto/ConsultationEntity.dto'

export class RequestFulfilledEvent {
  requestId: number
  consultation: ConsultationEntity

  constructor(rId: number, c: ConsultationEntity) {
    this.requestId = rId
    this.consultation = c
  }
}

export const RequestFulfilledKey = 'request.fulfilled'
