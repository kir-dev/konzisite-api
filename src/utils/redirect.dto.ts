import { HttpStatus } from '@nestjs/common'
import { IsIn, IsUrl } from 'class-validator'

export class RedirectDto {
  @IsUrl()
  url?: string

  @IsIn(Object.values(HttpStatus))
  statusCode?: HttpStatus
}
