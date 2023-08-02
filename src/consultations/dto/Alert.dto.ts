export const AlertType: {
  [x: string]: 'info' | 'warning' | 'error' | 'success'
} = {
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'success',
}
export type AlertType = (typeof AlertType)[keyof typeof AlertType]

export class Alert {
  id: number
  description: string
  type: AlertType
  validUntil: Date
}
