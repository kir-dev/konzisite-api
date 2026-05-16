export class ConsultationCreatedEvent {
  consultationId: number

  constructor(cId: number) {
    this.consultationId = cId
  }
}

export const ConsultationCreatedKey = 'consultation.created'
