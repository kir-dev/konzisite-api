export class ConsultationDetailsChangedEvent {
  consultationId: number
  locationChanged?: ValueChange<string>
  startDateChanged?: ValueChange<Date>
  endDateChanged?: ValueChange<Date>

  constructor(
    cId: number,
    locationChanged?: ValueChange<string>,
    startDateChange?: ValueChange<Date>,
    endDateChange?: ValueChange<Date>,
  ) {
    this.consultationId = cId
    this.locationChanged = locationChanged
    this.startDateChanged = startDateChange
    this.endDateChanged = endDateChange
  }
}

export const ConsultationDetailsChangedKey = 'consultation.update'

export type ValueChange<T> = {
  oldValue: T
  newValue: T
}
