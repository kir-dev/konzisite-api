export class RequestFulfilledEvent {
  requestId: number
  consultationId: number

  constructor(rId: number, cId: number) {
    this.requestId = rId
    this.consultationId = cId
  }
}

export const RequestFulfilledKey = 'request.fulfilled'
