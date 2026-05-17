export class ConsultationPresentersChangedEvent {
  consultationId: number
  newPresenterIds: number[]

  constructor(cId: number, ids: number[]) {
    this.consultationId = cId
    this.newPresenterIds = ids
  }
}

export const ConsultationPresentersChangedKey =
  'consultation.presenters.changed'
