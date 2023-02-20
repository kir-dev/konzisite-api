import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator'

export class RequestEntity {
  @IsInt()
  @Min(1)
  id: number

  @IsNotEmpty()
  name: string

  @IsOptional()
  descMarkdown: string

  @IsDateString()
  expiryDate: Date
}
