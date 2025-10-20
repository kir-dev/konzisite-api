export class LocationChangedEvent {
  consultationId: number

  constructor(cId: number) {
    this.consultationId = cId
  }
}

export const LocationChangedKey = 'consultation.locationChanged'
